//
//  TwilioVoiceReactNative+CallKit.m
//  TwilioVoiceReactNative
//
//  Copyright © 2022 Twilio, Inc. All rights reserved.
//

@import CallKit;
@import TwilioVoice;

#import <React/RCTLog.h>

#import "TwilioVoiceReactNative.h"
#import "TwilioVoiceReactNativeConstants.h"
#import "TwilioVoicePushRegistry.h"

NSString * const kDefaultCallKitConfigurationName = @"Twilio Voice React Native";

// Must match the s.resource_bundles key in twilio-voice-react-native.podspec.
NSString * const kTwilioVoiceReactNativeResourceBundleName = @"TwilioVoiceReactNativeAssets";

@interface TwilioVoiceReactNative (CallKit) <CXProviderDelegate, TVOCallDelegate, AVAudioPlayerDelegate>

// Runs `block` (which calls into TwilioVoice.framework on behalf of `action`)
// under an exception guard. See the doc comment on the implementation for why
// this exists.
- (BOOL)tvrn_performCallKitAction:(CXAction *)action block:(void (^)(void))block;

@end

@implementation TwilioVoiceReactNative (CallKit)

#pragma mark - CallKit helper methods

- (void)initializeCallKit {
    [self initializeCallKitWithConfiguration:nil];
}

- (void)initializeCallKitWithConfiguration:(NSDictionary *)configuration {
    CXProviderConfiguration *callKitConfiguration = [CXProviderConfiguration new];
    
    if (configuration[kTwilioVoiceReactNativeCallKitMaximumCallGroups]) {
        callKitConfiguration.maximumCallGroups = [configuration[kTwilioVoiceReactNativeCallKitMaximumCallGroups] intValue];
    } else {
        callKitConfiguration.maximumCallGroups = 1;
    }

    if (configuration[kTwilioVoiceReactNativeCallKitMaximumCallsPerCallGroup]) {
        callKitConfiguration.maximumCallsPerCallGroup = [configuration[kTwilioVoiceReactNativeCallKitMaximumCallsPerCallGroup] intValue];
    } else {
        callKitConfiguration.maximumCallsPerCallGroup = 1;
    }

    float version = [[UIDevice currentDevice].systemVersion floatValue];
    if (version > 11.0 && configuration[kTwilioVoiceReactNativeCallKitIncludesCallsInRecents]) {
        callKitConfiguration.includesCallsInRecents = [configuration[kTwilioVoiceReactNativeCallKitIncludesCallsInRecents] boolValue];
    }

    if (configuration[kTwilioVoiceReactNativeCallKitSupportedHandleTypes]) {
        NSSet *supportedHandleTypes = [NSSet setWithArray:configuration[kTwilioVoiceReactNativeCallKitSupportedHandleTypes]];
        callKitConfiguration.supportedHandleTypes = supportedHandleTypes;
    } else {
        callKitConfiguration.supportedHandleTypes = [NSSet setWithArray:@[@(CXHandleTypeGeneric), @(CXHandleTypePhoneNumber)]];
    }

    if (configuration[kTwilioVoiceReactNativeCallKitIconTemplateImageData] && [configuration[kTwilioVoiceReactNativeCallKitIconTemplateImageData] isKindOfClass:[NSString class]]) {
        UIImage *icon = [UIImage imageNamed:configuration[kTwilioVoiceReactNativeCallKitIconTemplateImageData]];
        callKitConfiguration.iconTemplateImageData = UIImagePNGRepresentation(icon);
    }

    if (configuration[kTwilioVoiceReactNativeCallKitRingtoneSound] && [configuration[kTwilioVoiceReactNativeCallKitRingtoneSound] isKindOfClass:[NSString class]]) {
        callKitConfiguration.ringtoneSound = configuration[kTwilioVoiceReactNativeCallKitRingtoneSound];
    }
    
    // Use the shared CXProvider from TwilioVoicePushRegistry.
    // This provider was created very early (in +initialize) so that
    // incoming VoIP pushes can report to CallKit immediately, even
    // before the RN module is initialized.  We update its configuration
    // and set ourselves as delegate so we receive all CallKit actions.
    [TwilioVoicePushRegistry setSharedCallKitProviderConfiguration:callKitConfiguration];
    self.callKitProvider = [TwilioVoicePushRegistry sharedCallKitProvider];
    [self.callKitProvider setDelegate:self queue:nil];
    self.callKitCallController = [CXCallController new];
}

- (NSString *)getDisplayName:(NSString *)template
            customParameters:(NSDictionary<NSString *, NSString *> *)customParameters {
    NSString *processedTemplate = template;
    for (NSString *paramKey in customParameters) {
        NSString *paramValue = customParameters[paramKey];
        NSString *wrappedParamKey = [NSString stringWithFormat:@"${%@}", paramKey];
        processedTemplate = [processedTemplate stringByReplacingOccurrencesOfString:wrappedParamKey withString:paramValue];
    }
    return processedTemplate;
}

- (void)reportNewIncomingCall:(TVOCallInvite *)callInvite {
    NSString *handleName = callInvite.from;
    if (handleName == nil) {
        handleName = @"Unknown Caller";
    }

    NSUserDefaults *preferences = [NSUserDefaults standardUserDefaults];
    NSString *preferenceKey = @"incomingCallContactHandleTemplate";
    if ([preferences objectForKey:preferenceKey] != nil) {
        const NSString *preferenceVal = [preferences stringForKey:preferenceKey];
        if ([preferenceVal length] > 0) {
            handleName = [self getDisplayName:preferenceVal customParameters:[callInvite customParameters]];
        }
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

    [self.callKitProvider reportNewIncomingCallWithUUID:callInvite.uuid update:callUpdate completion:^(NSError *error) {
        if (!error) {
            NSLog(@"Incoming call successfully reported.");
        } else {
            NSLog(@"Failed to report incoming call: %@.", error);
        }
    }];
}

- (void)answerCallInvite:(NSUUID *)uuid
              completion:(void(^)(BOOL success))completionHandler {
    self.callKitCompletionCallback = completionHandler;
    CXAnswerCallAction *answerCallAction = [[CXAnswerCallAction alloc] initWithCallUUID:uuid];
    CXTransaction *transaction = [[CXTransaction alloc] initWithAction:answerCallAction];

    [self.callKitCallController requestTransaction:transaction completion:^(NSError *error) {
        if (error) {
            NSLog(@"Failed to submit answer-call transaction request: %@", error);
        } else {
            NSLog(@"Answer-call transaction successfully done");
        }
    }];
}

- (void)endCallWithUuid:(NSUUID *)uuid {
    CXEndCallAction *endCallAction = [[CXEndCallAction alloc] initWithCallUUID:uuid];
    CXTransaction *transaction = [[CXTransaction alloc] initWithAction:endCallAction];
    
    [self.callKitCallController requestTransaction:transaction completion:^(NSError *error) {
        if (error) {
            NSLog(@"Failed to submit end-call transaction request: %@", error);
        } else {
            NSLog(@"End-call transaction successfully done");
        }
    }];
}

- (void)makeCallWithAccessToken:(NSString *)accessToken
                         params:(NSDictionary *)params
                  contactHandle:(NSString *)contactHandle {
    self.accessToken = accessToken;
    self.twimlParams = params;
    
    NSString *handle = @"Default Contact";
    if ([contactHandle length] > 0) {
        handle = contactHandle;
    }

    CXHandle *callHandle = [[CXHandle alloc] initWithType:CXHandleTypeGeneric value:handle];
    NSUUID *uuid = [NSUUID UUID];
    CXStartCallAction *startCallAction = [[CXStartCallAction alloc] initWithCallUUID:uuid handle:callHandle];
    CXTransaction *transaction = [[CXTransaction alloc] initWithAction:startCallAction];

    [self.callKitCallController requestTransaction:transaction completion:^(NSError *error) {
        if (error) {
            NSLog(@"StartCallAction transaction request failed: %@", [error localizedDescription]);
        } else {
            NSLog(@"StartCallAction transaction request successful");

            CXCallUpdate *callUpdate = [[CXCallUpdate alloc] init];

            callUpdate.remoteHandle = callHandle;
            callUpdate.supportsDTMF = YES;
            callUpdate.supportsHolding = YES;
            callUpdate.supportsGrouping = NO;
            callUpdate.supportsUngrouping = NO;
            callUpdate.hasVideo = NO;

            [self.callKitProvider reportCallWithUUID:uuid updated:callUpdate];
        }
    }];
}

- (void)performVoiceCallWithUUID:(NSUUID *)uuid
                          client:(NSString *)client
                      completion:(void(^)(BOOL success))completionHandler {
    TVOConnectOptions *connectOptions = [TVOConnectOptions optionsWithAccessToken:self.accessToken block:^(TVOConnectOptionsBuilder *builder) {
        builder.params = self.twimlParams;
        builder.uuid = uuid;
        builder.callMessageDelegate = self;
    }];
    TVOCall *call = [TwilioVoiceSDK connectWithOptions:connectOptions delegate:self];
    if (call) {
        self.callMap[call.uuid.UUIDString] = call;
        self.callPromiseResolver([self callInfo:call]);
    }
    self.callKitCompletionCallback = completionHandler;
}

- (void)performAnswerVoiceCallWithUUID:(NSUUID *)uuid
                            completion:(void(^)(BOOL success))completionHandler {
    TVOCallInvite *callInvite = self.callInviteMap[uuid.UUIDString];
    if (!callInvite) {
        // The caller can hang up (or the invite can simply expire) in the
        // window between CallKit showing the incoming-call UI and the user
        // tapping Answer -- callInviteMap is already empty by the time this
        // runs. That used to be NSAssert, which raises just like a
        // TwilioVoice.framework precondition failure and is exactly the
        // "acting on a call that is already disconnected or unknown" shape
        // PRO-7753 is about: fail the action instead of aborting the process.
        RCTLogError(@"[TwilioVoiceReactNative] performAnswerVoiceCallWithUUID: no call invite for %@ (already canceled/expired) -- failing instead of crashing.", uuid.UUIDString);
        completionHandler(NO);
        return;
    }
    TVOAcceptOptions *acceptOptions = [TVOAcceptOptions optionsWithCallInvite:callInvite block:^(TVOAcceptOptionsBuilder *builder) {
        builder.uuid = uuid;
        builder.callMessageDelegate = self;
    }];

    TVOCall *call = [callInvite acceptWithOptions:acceptOptions delegate:self];

    if (!call) {
        completionHandler(NO);
    } else {
        self.callMap[call.uuid.UUIDString] = call;
    }

    [self sendEventWithName:kTwilioVoiceReactNativeScopeCallInvite
                       body:@{
                         kTwilioVoiceReactNativeCallInviteEventKeyType: kTwilioVoiceReactNativeCallInviteEventTypeValueAccepted,
                         kTwilioVoiceReactNativeCallInviteEventKeyCallSid: callInvite.callSid,
                         kTwilioVoiceReactNativeEventKeyCallInvite: [self callInviteInfo:callInvite]}];
}

- (void)updateCall:(NSString *)uuid callerHandle:(NSString *)handle {
    CXHandle *callHandle = [[CXHandle alloc] initWithType:CXHandleTypeGeneric value:handle];
    CXCallUpdate *callUpdate = [[CXCallUpdate alloc] init];
    callUpdate.remoteHandle = callHandle;
    callUpdate.localizedCallerName = handle;
    callUpdate.supportsDTMF = YES;
    callUpdate.supportsHolding = YES;
    callUpdate.supportsGrouping = NO;
    callUpdate.supportsUngrouping = NO;
    callUpdate.hasVideo = NO;

    dispatch_async(dispatch_get_main_queue(), ^{
        [self.callKitProvider reportCallWithUUID:[[NSUUID alloc] initWithUUIDString:uuid] updated:callUpdate];
    });
}

#pragma mark - CXProviderDelegate

// TwilioVoice.framework raises a native NSException (not an NSError) when we
// act on a call/invite it considers invalid -- e.g. answering an invite the
// caller already canceled, or holding/muting/sending DTMF on a call that has
// already disconnected underneath us. CXProvider dispatches every
// performXCallAction: on the main thread with no exception handler of its
// own, so an uncaught raise here unwinds straight out of
// `-[CXProvider performAction:]` and takes the whole process down with it
// (PRO-7753: EXC_CRASH/SIGABRT, main thread, mid-call). The app dying does not
// end the call -- it keeps running server-side until Twilio's own RTP-timeout
// watchdog (warning 32014) tears it down 60-90s later, with nobody able to
// see or end it in between.
//
// This is the single choke point every performXCallAction: routes its
// TwilioVoice SDK call through: @try/@catch here turns a raise into a normal
// failed CallKit action (`[action fail]`) instead of a SIGABRT. Callers must
// NOT also call `fulfill`/`fail` inside `block` -- this method owns reporting
// failure back to CallKit; the caller is only responsible for `fulfill` on
// success (via the returned BOOL).
- (BOOL)tvrn_performCallKitAction:(CXAction *)action block:(void (^)(void))block {
    @try {
        block();
        return YES;
    } @catch (NSException *exception) {
        RCTLogError(@"[TwilioVoiceReactNative] TwilioVoice raised %@ handling %@ (uuid %@): %@ -- failing the CallKit action instead of crashing.",
                    exception.name, NSStringFromClass([action class]), action.callUUID.UUIDString, exception.reason);
        [action fail];
        return NO;
    }
}

- (void)providerDidReset:(CXProvider *)provider {
    [TwilioVoiceReactNative twilioAudioDevice].enabled = NO;

    // The only path that reaches "ringback starts and never stops". A reset
    // orphans the TVOCall, so no didDisconnect fires and callDisconnected: --
    // the usual owner of stopRingback -- never runs, leaving the tone looping
    // with no call behind it and no way for the user to silence it.
    //
    // callMap is deliberately left populated: it is the sole strong reference
    // to the live TVOCalls, and every other consumer (performEndCallAction:,
    // getCalls, sendCallMessage) reads it to reach one. Clearing it here would
    // dealloc calls that are still up on the wire with nothing left to
    // disconnect them. Doing this properly means disconnecting each call and
    // emitting the JS events, which is a behavioral change, not a leak fix.
    [self stopRingback];
}

- (void)providerDidBegin:(CXProvider *)provider {
    
}

- (void)provider:(CXProvider *)provider didActivateAudioSession:(AVAudioSession *)audioSession {
    [TwilioVoiceReactNative twilioAudioDevice].enabled = YES;
}

- (void)provider:(CXProvider *)provider didDeactivateAudioSession:(AVAudioSession *)audioSession {
    [TwilioVoiceReactNative twilioAudioDevice].enabled = NO;
}

- (void)provider:(CXProvider *)provider performEndCallAction:(CXEndCallAction *)action {
    BOOL succeeded = [self tvrn_performCallKitAction:action block:^{
        if (self.callMap[action.callUUID.UUIDString]) {
            TVOCall *call = self.callMap[action.callUUID.UUIDString];
            [call disconnect];
        } else if (self.callInviteMap[action.callUUID.UUIDString]) {
            TVOCallInvite *callInvite = self.callInviteMap[action.callUUID.UUIDString];
            [callInvite reject];
            [self sendEventWithName:kTwilioVoiceReactNativeScopeCallInvite
                               body:@{
                                 kTwilioVoiceReactNativeCallInviteEventKeyType: kTwilioVoiceReactNativeCallInviteEventTypeValueRejected,
                                 kTwilioVoiceReactNativeCallInviteEventKeyCallSid: callInvite.callSid,
                                 kTwilioVoiceReactNativeEventKeyCallInvite: [self callInviteInfo:callInvite]}];
            [self.callInviteMap removeObjectForKey:action.callUUID.UUIDString];
        }
    }];

    if (succeeded) {
        [action fulfill];
    }
}

- (void)provider:(CXProvider *)provider performStartCallAction:(CXStartCallAction *)action {
    [TwilioVoiceReactNative twilioAudioDevice].enabled = NO;
    [TwilioVoiceReactNative twilioAudioDevice].block();

    [self.callKitProvider reportOutgoingCallWithUUID:action.callUUID startedConnectingAtDate:[NSDate date]];

    __weak typeof(self) weakSelf = self;
    BOOL succeeded = [self tvrn_performCallKitAction:action block:^{
        [weakSelf performVoiceCallWithUUID:action.callUUID client:nil completion:^(BOOL success) {
            __strong typeof(self) strongSelf = weakSelf;
            if (success) {
                NSLog(@"performVoiceCallWithUUID successful");
                [strongSelf.callKitProvider reportOutgoingCallWithUUID:action.callUUID connectedAtDate:[NSDate date]];
            } else {
                NSLog(@"performVoiceCallWithUUID failed");
            }
        }];
    }];

    if (succeeded) {
        [action fulfill];
    }
}

- (void)provider:(CXProvider *)provider performAnswerCallAction:(CXAnswerCallAction *)action {
    [TwilioVoiceReactNative twilioAudioDevice].enabled = NO;
    [TwilioVoiceReactNative twilioAudioDevice].block();

    BOOL succeeded = [self tvrn_performCallKitAction:action block:^{
        [self performAnswerVoiceCallWithUUID:action.callUUID completion:^(BOOL success) {
            if (success) {
                NSLog(@"performAnswerVoiceCallWithUUID successful");
            } else {
                NSLog(@"performAnswerVoiceCallWithUUID failed");
            }
        }];
    }];

    if (succeeded) {
        [action fulfill];
    }
}

- (void)provider:(CXProvider *)provider performSetHeldCallAction:(CXSetHeldCallAction *)action {
    TVOCall *call = self.callMap[action.callUUID.UUIDString];
    if (!call) {
        [action fail];
        return;
    }

    BOOL succeeded = [self tvrn_performCallKitAction:action block:^{
        [call setOnHold:action.isOnHold];
    }];

    if (succeeded) {
        [action fulfill];
    }
}

- (void)provider:(CXProvider *)provider performSetMutedCallAction:(CXSetMutedCallAction *)action {
    TVOCall *call = self.callMap[action.callUUID.UUIDString];
    if (!call) {
        [action fail];
        return;
    }

    BOOL succeeded = [self tvrn_performCallKitAction:action block:^{
        [call setMuted:action.isMuted];
    }];

    if (succeeded) {
        [action fulfill];
    }
}

- (void)provider:(CXProvider *)provider performPlayDTMFCallAction:(CXPlayDTMFCallAction *)action {
    TVOCall *call = self.callMap[action.callUUID.UUIDString];
    if (!call) {
        [action fail];
        return;
    }

    BOOL succeeded = [self tvrn_performCallKitAction:action block:^{
        [call sendDigits:action.digits];
    }];

    if (succeeded) {
        [action fulfill];
    }
}

#pragma mark - TVOCallDelegate

- (void)callDidStartRinging:(TVOCall *)call {
    [self playRingback];

    [self sendEventWithName:kTwilioVoiceReactNativeScopeCall
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventRinging,
                              kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call]}];
}

- (void)callDidConnect:(TVOCall *)call {
    self.callConnectMap[call.uuid.UUIDString] = [self getSimplifiedISO8601FormattedTimestamp:[NSDate date]];

    [self stopRingback];

    [self sendEventWithName:kTwilioVoiceReactNativeScopeCall
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventConnected,
                              kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call]}];

    if (self.callKitCompletionCallback) {
        self.callKitCompletionCallback(YES);
        self.callKitCompletionCallback = nil;
    }
}

- (void)call:(TVOCall *)call didDisconnectWithError:(NSError *)error {
    NSDictionary *messageBody = [NSDictionary dictionary];
    if (error) {
        messageBody = @{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventDisconnected,
                        kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call],
                        kTwilioVoiceReactNativeVoiceErrorKeyError: @{kTwilioVoiceReactNativeVoiceErrorKeyCode: @(error.code),
                                                                     kTwilioVoiceReactNativeVoiceErrorKeyMessage: [error localizedDescription]}};
    } else {
        messageBody = @{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventDisconnected,
                        kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call]};
    }
    
    [self sendEventWithName:kTwilioVoiceReactNativeScopeCall body:messageBody];
    
    if (!self.userInitiatedDisconnect) {
        CXCallEndedReason reason = CXCallEndedReasonRemoteEnded;
        if (error) {
            reason = CXCallEndedReasonFailed;
        }
        
        [self.callKitProvider reportCallWithUUID:call.uuid endedAtDate:[NSDate date] reason:reason];
    }
    
    [self callDisconnected:call];
}

- (void)call:(TVOCall *)call didFailToConnectWithError:(NSError *)error {
    [self sendEventWithName:kTwilioVoiceReactNativeScopeCall
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventConnectFailure,
                              kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call],
                              kTwilioVoiceReactNativeVoiceErrorKeyError: @{kTwilioVoiceReactNativeVoiceErrorKeyCode: @(error.code),
                                                                           kTwilioVoiceReactNativeVoiceErrorKeyMessage: [error localizedDescription]}}];

    if (self.callKitCompletionCallback) {
        self.callKitCompletionCallback(NO);
        self.callKitCompletionCallback = nil;
    }
    [self.callKitProvider reportCallWithUUID:call.uuid endedAtDate:[NSDate date] reason:CXCallEndedReasonFailed];
    
    [self callDisconnected:call];
}

- (void)callDisconnected:(TVOCall *)call {
    for (NSString *uuidKey in [self.callMap allKeys]) {
        TVOCall *activeCall = self.callMap[uuidKey];
        if (activeCall == call) {
            [self.callMap removeObjectForKey:uuidKey];
            [self.callConnectMap removeObjectForKey:call.uuid.UUIDString];
            break;
        }
    }

    // Remove the corresponding call invite only when the incoming call is finished.
    [self.callInviteMap removeObjectForKey:call.uuid.UUIDString];
    
    [self stopRingback];
    self.userInitiatedDisconnect = NO;
}

- (void)call:(TVOCall *)call isReconnectingWithError:(NSError *)error {
    [self sendEventWithName:kTwilioVoiceReactNativeScopeCall
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventReconnecting,
                              kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call],
                              kTwilioVoiceReactNativeVoiceErrorKeyError: @{kTwilioVoiceReactNativeVoiceErrorKeyCode: @(error.code),
                                                                           kTwilioVoiceReactNativeVoiceErrorKeyMessage: [error localizedDescription]}}];
}

- (void)callDidReconnect:(TVOCall *)call {
    [self sendEventWithName:kTwilioVoiceReactNativeScopeCall
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventReconnected,
                              kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call]}];
}

- (void)call:(TVOCall *)call
didReceiveQualityWarnings:(NSSet<NSNumber *> *)currentWarnings
previousWarnings:(NSSet<NSNumber *> *)previousWarnings {
    NSMutableArray<NSString *> *currentWarningEvents = [NSMutableArray array];
    for (NSNumber *warning in currentWarnings) {
        NSString *event = [self warningNameWithNumber:warning];
        [currentWarningEvents addObject:event];
    }

    NSMutableArray<NSString *> *previousWarningEvents = [NSMutableArray array];
    for (NSNumber *warning in previousWarnings) {
        NSString *event = [self warningNameWithNumber:warning];
        [previousWarningEvents addObject:event];
    }

    [self sendEventWithName:kTwilioVoiceReactNativeScopeCall
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventQualityWarningsChanged,
                              kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call],
                              kTwilioVoiceReactNativeCallEventCurrentWarnings: currentWarningEvents,
                              kTwilioVoiceReactNativeCallEventPreviousWarnings: previousWarningEvents}];
}

#pragma mark - Ringback

// Resources vendored by this pod live in its own resource bundle, never in the
// host app's mainBundle. Looking them up in mainBundle is what made ringback a
// silent no-op on iOS since 2021 (PRO-5724). Under static linking the bundle is
// copied into the app; under use_frameworks! it sits inside the framework --
// bundleForClass: plus the nested-bundle lookup covers both, and falls back to
// the containing bundle if CocoaPods flattened it.
- (NSBundle *)tvrn_resourceBundle {
    NSBundle *containingBundle = [NSBundle bundleForClass:[self class]];
    NSURL *bundleURL = [containingBundle URLForResource:kTwilioVoiceReactNativeResourceBundleName
                                          withExtension:@"bundle"];
    return bundleURL ? [NSBundle bundleWithURL:bundleURL] : containingBundle;
}

- (void)playRingback {
    NSString *ringtonePath = [[self tvrn_resourceBundle] pathForResource:@"ringtone" ofType:@"wav"];
    if (ringtonePath.length == 0) {
        // RCTLogError, not NSLog: an unplayable ringback must not kill the call,
        // but it must not hide in the console for another five years either.
        RCTLogError(@"[TwilioVoiceReactNative] Ringback asset 'ringtone.wav' not found in %@.bundle -- outgoing calls will be silent while ringing.",
                    kTwilioVoiceReactNativeResourceBundleName);
        return;
    }

    NSError *error;
    // fileURLWithPath, not URLWithString: pathForResource returns a filesystem
    // path, which URLWithString turns into a scheme-less URL AVAudioPlayer
    // cannot open (and nil outright if the path contains a space).
    self.ringbackPlayer = [[AVAudioPlayer alloc] initWithContentsOfURL:[NSURL fileURLWithPath:ringtonePath]
                                                                 error:&error];
    if (self.ringbackPlayer == nil) {
        RCTLogError(@"[TwilioVoiceReactNative] Failed to initialize ringback player: %@", error);
        return;
    }

    // ponytail: no AVAudioSession category/activation set here -- nothing else in
    // this SDK touches the session, it is owned by TVODefaultAudioDevice + CallKit.
    // If a device test shows the tone inaudible or on the wrong route, that is the
    // knob to turn.
    self.ringbackPlayer.delegate = self;
    self.ringbackPlayer.numberOfLoops = -1;
    self.ringbackPlayer.volume = 1.0f;

    // AVAudioPlayer pauses on interruption and never resumes on its own. An
    // incoming cellular or FaceTime call mid-ring would otherwise kill the tone
    // for the rest of the ring with no error and no log -- the same silence
    // PRO-5724 is about, arriving by a different route.
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleRingbackInterruption:)
                                                 name:AVAudioSessionInterruptionNotification
                                               object:nil];

    [self.ringbackPlayer play];
}

- (void)handleRingbackInterruption:(NSNotification *)notification {
    // AVAudioSessionInterruptionNotification is not documented to be delivered on
    // the main queue, and this is the only reader of ringbackPlayer that is not
    // already main-queue-confined. ringbackPlayer is nonatomic, and stopRingback
    // nils (releases) it from main-queue delegate callbacks -- reading it off-queue
    // races that release, which is a use-after-free, not a nil no-op. Hopping the
    // whole body onto the main queue puts every access on the same queue as
    // playRingback/stopRingback. Note the body must RE-READ self.ringbackPlayer at
    // execution time; capturing the pointer here would reintroduce the same race.
    dispatch_async(dispatch_get_main_queue(), ^{
        // Stale notification after the call moved on; nothing to resume.
        if (self.ringbackPlayer == nil) {
            return;
        }

        AVAudioSessionInterruptionType type =
            [notification.userInfo[AVAudioSessionInterruptionTypeKey] unsignedIntegerValue];
        if (type != AVAudioSessionInterruptionTypeEnded) {
            return;
        }

        AVAudioSessionInterruptionOptions options =
            [notification.userInfo[AVAudioSessionInterruptionOptionKey] unsignedIntegerValue];
        if ((options & AVAudioSessionInterruptionOptionShouldResume) == 0) {
            RCTLogError(@"[TwilioVoiceReactNative] Audio session interruption ended without ShouldResume -- ringback will stay silent for the rest of this ring.");
            return;
        }

        if (![self.ringbackPlayer play]) {
            RCTLogError(@"[TwilioVoiceReactNative] Failed to resume ringback after audio session interruption -- the tone will be silent for the rest of this ring.");
        }
    });
}

- (void)stopRingback {
    // Unregister by name, never the blanket removeObserver:self -- this object
    // observes push-registry and route-change notifications for its whole
    // lifetime, and a blanket removal here would silently tear those down too.
    [[NSNotificationCenter defaultCenter] removeObserver:self
                                                    name:AVAudioSessionInterruptionNotification
                                                  object:nil];

    // No isPlaying guard: that left a non-playing player retained, and messaging
    // nil is a no-op anyway. Releasing it also resets playback position, so the
    // next call starts the tone from the top rather than mid-loop.
    [self.ringbackPlayer stop];
    self.ringbackPlayer = nil;
}

- (void)audioPlayerDidFinishPlaying:(AVAudioPlayer *)player successfully:(BOOL)flag {
    if (flag) {
        NSLog(@"Audio player finished playing successfully");
    } else {
        NSLog(@"Audio player finished playing with some error");
    }
}

- (void)audioPlayerDecodeErrorDidOccur:(AVAudioPlayer *)player error:(NSError *)error {
    // The last silent path: a wav that resolves and initializes but cannot be
    // decoded fails exactly like PRO-5724 did, with no signal at all.
    RCTLogError(@"[TwilioVoiceReactNative] Ringback decode error -- the tone will be silent: %@", error);
}

#pragma mark - Warning event conversion

- (NSString *)getSimplifiedISO8601FormattedTimestamp:(NSDate *)date {
    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    // en_US_POSIX, never currentLocale (Apple QA1480). With a user locale, the
    // device's 12/24-Hour Time switch overrides the format string: on a phone set
    // to 12-hour time "HH" renders 1-12 and the AM/PM designator is dropped
    // entirely, because the pattern has no "a". 14:31 serializes as "02:31", JS
    // parses it as 02:31, and the call timer reads exactly 12 hours too high --
    // the 720:03 on a 3-second-old call reported in PRO-5724. Android already
    // does this correctly (ReactNativeArgumentsSerializer uses Locale.US).
    formatter.locale = [NSLocale localeWithLocaleIdentifier:@"en_US_POSIX"];
    [formatter setDateFormat:@"yyyy'-'MM'-'dd'T'HH':'mm':'ss'.'SSSZ"];

    return [formatter stringFromDate:date];
}

@end
