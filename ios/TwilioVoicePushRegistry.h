//
//  TwilioVoicePushRegistry.h
//  TwilioVoiceReactNative
//
//  Copyright © 2022 Twilio, Inc. All rights reserved.
//

@import CallKit;
@import AVFoundation;

@class TVOCallInvite;
@class TVOCancelledCallInvite;

FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotification;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryEventType;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationDeviceTokenUpdated;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationDeviceToken;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationIncomingPushReceived;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationIncomingPushPayload;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationCallInvite;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationCancelledCallInviteReceived;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationCancelledCallInvite;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationCancelledCallInviteError;


/// A second call stack that shares this process's one CXProvider and one
/// PKPushRegistry with Twilio (PRO-8992: the SIP endpoint's push wake).
///
/// Apple allows ONE PushKit VoIP channel per app and kills an app that
/// returns from a VoIP push without reporting a call, so the non-Twilio stack
/// cannot own a registry or a provider of its own. Instead it registers here
/// and is offered every VoIP push FIRST; whatever it claims never reaches
/// TwilioVoiceSDK, and whatever it declines behaves exactly as before.
///
/// Every method is @optional and looked up with respondsToSelector: so the
/// app can register a Swift object without linking against this pod.
@protocol TwilioVoiceForeignCallDelegate <NSObject>
@optional
/// Offered on the PushKit queue (main) before Twilio parses the payload.
/// Return YES ONLY after reporting an incoming call on `provider`
/// synchronously, inside this call: the PushKit completion runs right after.
- (BOOL)twilioVoiceHandleForeignVoIPPush:(NSDictionary *)payload provider:(CXProvider *)provider;
/// Is `uuid` one of the foreign stack's CallKit calls? Every CXProvider
/// action for such a call is routed to the methods below instead of Twilio.
- (BOOL)twilioVoiceOwnsCallWithUUID:(NSUUID *)uuid;
- (void)twilioVoiceProvider:(CXProvider *)provider performAnswerCallAction:(CXAnswerCallAction *)action;
- (void)twilioVoiceProvider:(CXProvider *)provider performEndCallAction:(CXEndCallAction *)action;
- (void)twilioVoiceProvider:(CXProvider *)provider performSetMutedCallAction:(CXSetMutedCallAction *)action;
/// PRO-10332: the foreign stack reports its OUTGOING calls and live-socket
/// incoming calls on this provider too, so start, hold and DTMF reach it the
/// same way. A start action is routed only when the foreign stack claimed the
/// UUID before requesting the transaction (twilioVoiceOwnsCallWithUUID:).
- (void)twilioVoiceProvider:(CXProvider *)provider performStartCallAction:(CXStartCallAction *)action;
- (void)twilioVoiceProvider:(CXProvider *)provider performSetHeldCallAction:(CXSetHeldCallAction *)action;
- (void)twilioVoiceProvider:(CXProvider *)provider performPlayDTMFCallAction:(CXPlayDTMFCallAction *)action;
/// Audio-session hand-off. Offered first; return YES when the foreign stack
/// has a live call that owns the session, in which case Twilio's audio
/// device is left alone.
- (BOOL)twilioVoiceProvider:(CXProvider *)provider didActivateAudioSession:(AVAudioSession *)audioSession;
- (BOOL)twilioVoiceProvider:(CXProvider *)provider didDeactivateAudioSession:(AVAudioSession *)audioSession;
- (void)twilioVoiceProviderDidReset:(CXProvider *)provider;
@end

@interface TwilioVoicePushRegistry : NSObject

- (void)updatePushRegistry;

/// Shared CXProvider used for all CallKit interactions.
/// Created early in +initialize so it is available before the RN module loads.
+ (CXProvider *)sharedCallKitProvider;

/// Update the shared provider's configuration (called by the RN module when
/// the JS side sets CallKit configuration).
+ (void)setSharedCallKitProviderConfiguration:(CXProviderConfiguration *)configuration;

/// Claim a call invite that arrived before the RN module registered as an
/// NSNotificationCenter observer (cold-start race). Returns the invite and
/// clears the static slot atomically. Returns nil if none is pending.
+ (TVOCallInvite *)claimPendingCallInvite;

/// Register (or clear, with nil) the foreign call stack. Held strongly.
/// Must be set before the first VoIP push is delivered; an app does this
/// from application:didFinishLaunchingWithOptions:, which always runs before
/// PushKit's first (asynchronous, main-queue) delivery. CallKit actions reach
/// it through the RN module, which is the shared provider's delegate from
/// native module init onwards (initializeCallKit, before the registry exists).
+ (void)setForeignCallDelegate:(id<TwilioVoiceForeignCallDelegate>)delegate;
+ (id<TwilioVoiceForeignCallDelegate>)foreignCallDelegate;

/// YES when `uuid` belongs to the registered foreign stack.
+ (BOOL)foreignCallOwnsUUID:(NSUUID *)uuid;

/// Which CallKit actions reach the foreign delegate, so the foreign stack can
/// tell a fork that routes them from one that does not (it probes by
/// selector). 1: answer, end, setMuted, the audio session and reset
/// (PRO-8992). 2: also start, setHeld and playDTMF (PRO-10332).
+ (NSInteger)foreignCallRoutingVersion;

@end
