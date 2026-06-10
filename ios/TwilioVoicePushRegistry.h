//
//  TwilioVoicePushRegistry.h
//  TwilioVoiceReactNative
//
//  Copyright © 2022 Twilio, Inc. All rights reserved.
//

@import CallKit;

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

@end
