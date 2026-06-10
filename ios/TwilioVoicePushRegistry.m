//
//  TwilioVoicePushRegistry.m
//  TwilioVoiceReactNative
//
//  Copyright © 2022 Twilio, Inc. All rights reserved.
//

@import PushKit;
@import Foundation;
@import CallKit;
@import TwilioVoice;

#import "TwilioVoicePushRegistry.h"
#import "TwilioVoiceReactNative.h"
#import "TwilioVoiceReactNativeConstants.h"

NSString * const kTwilioVoicePushRegistryNotification = @"TwilioVoicePushRegistryNotification";
NSString * const kTwilioVoicePushRegistryEventType = @"type";
NSString * const kTwilioVoicePushRegistryNotificationDeviceTokenUpdated = @"deviceTokenUpdated";
NSString * const kTwilioVoicePushRegistryNotificationDeviceToken = @"deviceToken";
NSString * const kTwilioVoicePushRegistryNotificationIncomingPushReceived = @"incomingPushReceived";
NSString * const kTwilioVoicePushRegistryNotificationIncomingPushPayload = @"incomingPushPayload";
NSString * const kTwilioVoicePushRegistryNotificationCallInvite = @"callInvite";
NSString * const kTwilioVoicePushRegistryNotificationCancelledCallInviteReceived = @"cancelledCallInviteReceived";
NSString * const kTwilioVoicePushRegistryNotificationCancelledCallInvite = @"cancelledCallInvite";
NSString * const kTwilioVoicePushRegistryNotificationCancelledCallInviteError = @"cancelledCallInviteError";

static CXProvider *sSharedCallKitProvider;
static TVODefaultAudioDevice *sPushRegistryAudioDevice;
static TVOCallInvite *sPendingCallInvite;
// Holds the PushKit completion block until reportNewIncomingCall is called.
// Twilio's handleNotification: makes a network round-trip so callInviteReceived:
// fires asynchronously — calling completion() before it would trigger
// _terminateAppIfThereAreUnhandledVoIPPushes (PRO-4038).
static dispatch_block_t sPendingVoIPCompletion;

@interface TwilioVoicePushRegistry () <PKPushRegistryDelegate, TVONotificationDelegate>

@property (nonatomic, strong) PKPushRegistry *voipRegistry;
@property (nonatomic, copy) NSString *callInviteUuid;

@end

@implementation TwilioVoicePushRegistry

+ (void)initialize {
    if (self == [TwilioVoicePushRegistry class]) {
        CXProviderConfiguration *config = [CXProviderConfiguration new];
        config.maximumCallGroups = 1;
        config.maximumCallsPerCallGroup = 1;
        config.supportedHandleTypes = [NSSet setWithArray:@[@(CXHandleTypeGeneric), @(CXHandleTypePhoneNumber)]];
        sSharedCallKitProvider = [[CXProvider alloc] initWithConfiguration:config];
        NSLog(@"[TwilioVoicePushRegistry] Shared CallKit provider initialized");
    }
}

+ (CXProvider *)sharedCallKitProvider {
    return sSharedCallKitProvider;
}

+ (void)setSharedCallKitProviderConfiguration:(CXProviderConfiguration *)configuration {
    if (configuration) {
        sSharedCallKitProvider.configuration = configuration;
        NSLog(@"[TwilioVoicePushRegistry] Shared CallKit provider configuration updated");
    }
}

#pragma mark - TwilioVoicePushRegistry methods

- (void)updatePushRegistry {
    self.voipRegistry = [[PKPushRegistry alloc] initWithQueue:dispatch_get_main_queue()];
    self.voipRegistry.delegate = self;
    self.voipRegistry.desiredPushTypes = [NSSet setWithObject:PKPushTypeVoIP];
}

#pragma mark - PKPushRegistryDelegate

- (void)pushRegistry:(PKPushRegistry *)registry
didUpdatePushCredentials:(PKPushCredentials *)credentials
             forType:(NSString *)type {
    if ([type isEqualToString:PKPushTypeVoIP]) {
        [[NSNotificationCenter defaultCenter] postNotificationName:kTwilioVoicePushRegistryNotification
                                                            object:nil
                                                          userInfo:@{kTwilioVoicePushRegistryEventType: kTwilioVoicePushRegistryNotificationDeviceTokenUpdated,
                                                                     kTwilioVoicePushRegistryNotificationDeviceToken: credentials.token}];
    }
}

- (void)pushRegistry:(PKPushRegistry *)registry
didReceiveIncomingPushWithPayload:(PKPushPayload *)payload
             forType:(PKPushType)type
withCompletionHandler:(void (^)(void))completion {
    if ([type isEqualToString:PKPushTypeVoIP]) {
        NSLog(@"[TwilioVoicePushRegistry] VoIP push received — handling notification directly in native code");

        // Apple requires reportNewIncomingCall to be called BEFORE the completion
        // handler is invoked (PushKit checks inside completion() and calls
        // _terminateAppIfThereAreUnhandledVoIPPushes if it was not called).
        // Twilio's handleNotification: makes a network round-trip, so
        // callInviteReceived: fires asynchronously.  Store the block here and
        // call it from callInviteReceived: after reportNewIncomingCall (PRO-4038).
        sPendingVoIPCompletion = completion;

        // Ensure the Twilio audio device is configured.
        // The RN module normally does this, but it may not be initialized yet
        // after a long background suspension.
        if (![TwilioVoiceReactNative twilioAudioDevice]) {
            NSLog(@"[TwilioVoicePushRegistry] RN module audio device not ready — configuring fallback audio device");
            sPushRegistryAudioDevice = [TVODefaultAudioDevice audioDevice];
            TwilioVoiceSDK.audioDevice = sPushRegistryAudioDevice;
        }

        // Handle the notification DIRECTLY in native code.
        // callInviteReceived: will call reportNewIncomingCall then sPendingVoIPCompletion.
        [TwilioVoiceSDK handleNotification:payload.dictionaryPayload
                                  delegate:self
                             delegateQueue:nil
                       callMessageDelegate:nil];
        return;
    }

    completion();
}

- (void)pushRegistry:(PKPushRegistry *)registry
        didInvalidatePushTokenForType:(NSString *)type {
    // TODO: notify view-controller to emit event that the push-registry has been invalidated
}

#pragma mark - TVONotificationDelegate

- (void)callInviteReceived:(TVOCallInvite *)callInvite {
    NSLog(@"[TwilioVoicePushRegistry] callInviteReceived — reporting to CallKit immediately (uuid: %@)", callInvite.uuid.UUIDString);

    // Store the invite statically so the RN module can claim it even if it was not
    // yet registered as an NSNotificationCenter observer (cold-start race condition).
    sPendingCallInvite = callInvite;

    // Build caller display name from the invite, applying the same custom
    // handle template the RN module would use (stored in NSUserDefaults).
    NSString *handleName = callInvite.from ?: @"Unknown Caller";

    NSUserDefaults *preferences = [NSUserDefaults standardUserDefaults];
    NSString *preferenceKey = @"incomingCallContactHandleTemplate";
    NSString *preferenceVal = [preferences stringForKey:preferenceKey];
    if (preferenceVal.length > 0) {
        NSString *processedTemplate = [preferenceVal copy];
        for (NSString *paramKey in [callInvite customParameters]) {
            NSString *paramValue = [callInvite customParameters][paramKey];
            NSString *wrappedParamKey = [NSString stringWithFormat:@"${%@}", paramKey];
            processedTemplate = [processedTemplate stringByReplacingOccurrencesOfString:wrappedParamKey
                                                                            withString:paramValue];
        }
        handleName = processedTemplate;
    }

    CXHandle *callHandle = [[CXHandle alloc] initWithType:CXHandleTypeGeneric value:handleName];

    CXCallUpdate *callUpdate = [[CXCallUpdate alloc] init];
    callUpdate.remoteHandle = callHandle;
    callUpdate.localizedCallerName = handleName;
    callUpdate.supportsDTMF = YES;
    callUpdate.supportsHolding = YES;
    callUpdate.supportsGrouping = NO;
    callUpdate.supportsUngrouping = NO;
    callUpdate.hasVideo = NO;

    [sSharedCallKitProvider reportNewIncomingCallWithUUID:callInvite.uuid
                                                  update:callUpdate
                                              completion:^(NSError *error) {
        if (!error) {
            NSLog(@"[TwilioVoicePushRegistry] Incoming call successfully reported to CallKit.");
        } else {
            NSLog(@"[TwilioVoicePushRegistry] Failed to report incoming call to CallKit: %@.", error);
        }
    }];

    // reportNewIncomingCall has been called — now safe to call the deferred
    // PushKit completion block (PRO-4038).
    dispatch_block_t pendingCompletion = sPendingVoIPCompletion;
    sPendingVoIPCompletion = nil;
    if (pendingCompletion) {
        pendingCompletion();
    }

    // Notify the RN module so it can store the invite and emit a JS event
    // when it is ready.  We pass the TVOCallInvite object directly so the
    // RN module does NOT need to call handleNotification a second time.
    [[NSNotificationCenter defaultCenter] postNotificationName:kTwilioVoicePushRegistryNotification
                                                        object:nil
                                                      userInfo:@{kTwilioVoicePushRegistryEventType: kTwilioVoicePushRegistryNotificationIncomingPushReceived,
                                                                 kTwilioVoicePushRegistryNotificationCallInvite: callInvite}];
}

+ (TVOCallInvite *)claimPendingCallInvite {
    TVOCallInvite *invite = sPendingCallInvite;
    sPendingCallInvite = nil;
    return invite;
}

- (void)cancelledCallInviteReceived:(TVOCancelledCallInvite *)cancelledCallInvite error:(NSError *)error {
    NSLog(@"[TwilioVoicePushRegistry] cancelledCallInviteReceived (callSid: %@)", cancelledCallInvite.callSid);

    // Notify the RN module so it can match the cancelled invite, clean up, and
    // emit the JS event.
    NSMutableDictionary *userInfo = [@{
        kTwilioVoicePushRegistryEventType: kTwilioVoicePushRegistryNotificationCancelledCallInviteReceived,
        kTwilioVoicePushRegistryNotificationCancelledCallInvite: cancelledCallInvite
    } mutableCopy];
    if (error) {
        userInfo[kTwilioVoicePushRegistryNotificationCancelledCallInviteError] = error;
    }
    [[NSNotificationCenter defaultCenter] postNotificationName:kTwilioVoicePushRegistryNotification
                                                        object:nil
                                                      userInfo:userInfo];
}

@end
