//
//  TwilioVoiceReactNative+CallKit.m
//  TwilioVoiceReactNative
//
//  Copyright © 2022 Twilio, Inc. All rights reserved.
//

@import CallKit;
@import TwilioVoice;

#import <React/RCTLog.h>
#import <objc/message.h>

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
//
// Typed CXCallAction, not CXAction: `callUUID` is declared on CXCallAction,
// not on its CXAction superclass, and the @catch below reads action.callUUID
// for the log line. Every call site here (CXEndCallAction, CXStartCallAction,
// CXAnswerCallAction, CXSetHeldCallAction, CXSetMutedCallAction,
// CXPlayDTMFCallAction) is already a CXCallAction subclass, so this is not a
// behavioral narrowing -- just the type the method actually needs.
- (BOOL)tvrn_performCallKitAction:(CXCallAction *)action block:(void (^)(void))block;

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

    // CXProviderConfiguration defaults includesCallsInRecents to YES. Default it to
    // NO (matching the shared provider created in TwilioVoicePushRegistry +initialize)
    // so a nil/partial configuration -- e.g. the init-time initializeCallKit -- does not
    // silently put calls into the iOS Phone app's Recents (PRO-8886).
    callKitConfiguration.includesCallsInRecents = NO;

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
    if (completionHandler) {
        self.callKitCompletionCallbacks[uuid.UUIDString] = [completionHandler copy];
    }
    CXAnswerCallAction *answerCallAction = [[CXAnswerCallAction alloc] initWithCallUUID:uuid];
    CXTransaction *transaction = [[CXTransaction alloc] initWithAction:answerCallAction];

    [self.callKitCallController requestTransaction:transaction completion:^(NSError *error) {
        if (error) {
            NSLog(@"Failed to submit answer-call transaction request: %@", error);
            // The answer action never reached performAnswerCallAction, so
            // nothing else will settle the stored handler (the JS promise
            // would hang and the entry would leak).
            [self tvrn_completeCallKitCallbackForUuid:uuid success:NO];
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
        if (completionHandler) {
            self.callKitCompletionCallbacks[call.uuid.UUIDString] = [completionHandler copy];
        }
    } else if (completionHandler) {
        completionHandler(NO);
    }
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
        [self tvrn_completeCallKitCallbackForUuid:uuid success:NO];
        completionHandler(NO);
        return;
    }
    TVOAcceptOptions *acceptOptions = [TVOAcceptOptions optionsWithCallInvite:callInvite block:^(TVOAcceptOptionsBuilder *builder) {
        builder.uuid = uuid;
        builder.callMessageDelegate = self;
    }];

    TVOCall *call = [callInvite acceptWithOptions:acceptOptions delegate:self];

    if (!call) {
        [self tvrn_completeCallKitCallbackForUuid:uuid success:NO];
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

// PRO-8992: the foreign call stack (the app's SIP endpoint) shares this
// provider. Returns its delegate when `uuid` is one of ITS calls, so every
// action below can hand that call over before touching TwilioVoice state.
static id<TwilioVoiceForeignCallDelegate> TVRNForeignOwnerOf(NSUUID *uuid) {
    if (![TwilioVoicePushRegistry foreignCallOwnsUUID:uuid]) {
        return nil;
    }
    return [TwilioVoicePushRegistry foreignCallDelegate];
}

// Hand `action` to the foreign stack when it owns the call (PRO-10332).
// Returns YES when the action was the foreign stack's to settle -- including
// when it lacks `selector` or raises, in which case the action is failed here
// so CallKit never waits on it. NO means the call is Twilio's.
static BOOL TVRNRouteActionToForeign(CXProvider *provider, CXCallAction *action, SEL selector) {
    id<TwilioVoiceForeignCallDelegate> foreign = TVRNForeignOwnerOf(action.callUUID);
    if (!foreign) {
        return NO;
    }
    if (![foreign respondsToSelector:selector]) {
        [action fail];
        return YES;
    }
    @try {
        // The three routed selectors share the (provider, action) -> void shape.
        void (*send)(id, SEL, CXProvider *, CXCallAction *) = (void *)objc_msgSend;
        send(foreign, selector, provider, action);
    } @catch (NSException *exception) {
        NSLog(@"[TwilioVoiceReactNative] Foreign delegate raised %@ on %@ -- failing it", exception.name, NSStringFromClass([action class]));
        [action fail];
    }
    return YES;
}

// Offer an audio-session transition to the foreign stack. YES means it owns
// the session right now and the shared Twilio audio device must be left alone.
static BOOL TVRNForeignClaimsAudioSession(CXProvider *provider, AVAudioSession *audioSession, BOOL activated) {
    id<TwilioVoiceForeignCallDelegate> foreign = [TwilioVoicePushRegistry foreignCallDelegate];
    SEL selector = activated
        ? @selector(twilioVoiceProvider:didActivateAudioSession:)
        : @selector(twilioVoiceProvider:didDeactivateAudioSession:);
    if (!foreign || ![foreign respondsToSelector:selector]) {
        return NO;
    }
    @try {
        return activated
            ? [foreign twilioVoiceProvider:provider didActivateAudioSession:audioSession]
            : [foreign twilioVoiceProvider:provider didDeactivateAudioSession:audioSession];
    } @catch (NSException *exception) {
        NSLog(@"[TwilioVoiceReactNative] Foreign delegate raised %@ on an audio-session %@ -- Twilio keeps it", exception.name, activated ? @"activation" : @"deactivation");
        return NO;
    }
}

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
- (BOOL)tvrn_performCallKitAction:(CXCallAction *)action block:(void (^)(void))block {
    @try {
        block();
        return YES;
    } @catch (NSException *exception) {
        RCTLogError(@"[TwilioVoiceReactNative] TwilioVoice raised %@ handling %@ (uuid %@): %@ -- failing the CallKit action instead of crashing.",
                    exception.name, NSStringFromClass([action class]), action.callUUID.UUIDString, exception.reason);
        [action fail];
        // Settle any handler stored for this call too (answerCallInvite:),
        // else its JS promise hangs and the dictionary entry leaks.
        [self tvrn_completeCallKitCallbackForUuid:action.callUUID success:NO];
        return NO;
    }
}

// Is there a call other than `uuid` still up (anything but Disconnected)?
// callMap is the sole registry of live TVOCalls (see providerDidReset:), and a
// call is added to it synchronously inside its own CallKit start/answer action,
// so at the moment a second action runs the first call is already in here.
- (BOOL)tvrn_hasOtherLiveCallExcludingUuid:(NSUUID *)uuid {
    for (NSString *key in self.callMap) {
        if ([key isEqualToString:uuid.UUIDString]) {
            continue;
        }
        TVOCall *other = self.callMap[key];
        if (other && other.state != TVOCallStateDisconnected) {
            return YES;
        }
    }
    return NO;
}

// --- Audio-session timeline (PRO-12171) ---------------------------------
// "Connected but dead air both ways" is the signature of CallKit never calling
// provider:didActivateAudioSession: for a call whose device we disabled in
// tvrn_prepareAudioDeviceForCallWithUuid:. JS cannot see that layer, so every
// step that touches the shared audio device is recorded here (capped ring) and
// read back through voice_getAudioSessionTimeline into the call report.
// Diagnostic only: nothing below changes `enabled` or the session.
static NSMutableArray<NSDictionary *> *TVRNAudioTimeline(void) {
    static NSMutableArray *timeline;
    static dispatch_once_t once;
    dispatch_once(&once, ^{ timeline = [NSMutableArray array]; });
    return timeline;
}
static NSMutableDictionary<NSString *, NSNumber *> *TVRNPrepareTimes(void) {
    static NSMutableDictionary *times;
    static dispatch_once_t once;
    dispatch_once(&once, ^{ times = [NSMutableDictionary dictionary]; });
    return times;
}
static double TVRNLastDidActivateMs = 0;
// didActivate is written on CallKit's queue and read on main; guard it.
static NSObject *TVRNLastDidActivateLock(void) {
    static NSObject *lock;
    static dispatch_once_t once;
    dispatch_once(&once, ^{ lock = [NSObject new]; });
    return lock;
}
static NSUInteger const TVRNAudioTimelineCap = 200;
static NSTimeInterval const TVRNActivationGraceSeconds = 3.0;

static double TVRNNowMs(void) {
    return round([[NSDate date] timeIntervalSince1970] * 1000.0);
}

void TVRNRecordAudioEvent(NSString *event, NSString *callUuid) {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    NSMutableDictionary *entry = [@{
        @"event": event,
        @"timestamp": @(TVRNNowMs()),
        @"enabled": @([TwilioVoiceReactNative twilioAudioDevice].enabled),
        @"category": session.category ?: @"",
        @"mode": session.mode ?: @"",
        @"categoryOptions": @(session.categoryOptions),
        @"otherAudioPlaying": @(session.isOtherAudioPlaying),
    } mutableCopy];
    if (callUuid) {
        entry[@"callUuid"] = callUuid;
    }
    NSLog(@"[TwilioVoiceReactNative] audio-session %@", entry);
    @synchronized (TVRNAudioTimeline()) {
        [TVRNAudioTimeline() addObject:entry];
        if (TVRNAudioTimeline().count > TVRNAudioTimelineCap) {
            [TVRNAudioTimeline() removeObjectAtIndex:0];
        }
    }
}

NSArray<NSDictionary *> *TVRNAudioTimelineSnapshot(void) {
    @synchronized (TVRNAudioTimeline()) {
        return [TVRNAudioTimeline() copy];
    }
}

// Reset the shared audio device ahead of a new call's CallKit audio session
// activation. TVODefaultAudioDevice is ONE process-wide instance that carries
// the audio for every call, so disabling it and re-running its setup block
// while another call is live stops that call's audio (Twilio keeps signaling
// but sees no RTP and ends the leg) -- and when CallKit does not re-activate
// an already-active session, nothing sets `enabled` back to YES. Only reset it
// when this is the only call.
- (void)tvrn_prepareAudioDeviceForCallWithUuid:(NSUUID *)uuid {
    TVRNRecordAudioEvent(@"prepare", uuid.UUIDString);
    if ([self tvrn_hasOtherLiveCallExcludingUuid:uuid]) {
        RCTLogWarn(@"[TwilioVoiceReactNative] Another call is live -- leaving the shared audio device enabled for call %@.", uuid.UUIDString);
        return;
    }
    // Only a call whose device was actually reset can be waiting on a fresh
    // didActivate; a call-waiting call (early return above) rides the live one.
    @synchronized (TVRNPrepareTimes()) {
        if (TVRNPrepareTimes().count > 50) {
            [TVRNPrepareTimes() removeAllObjects];
        }
        TVRNPrepareTimes()[uuid.UUIDString] = @(TVRNNowMs());
    }
    [TwilioVoiceReactNative twilioAudioDevice].enabled = NO;
    [TwilioVoiceReactNative twilioAudioDevice].block();
    TVRNRecordAudioEvent(@"device-reset", uuid.UUIDString);
}

// Invoke and drop the CallKit completion handler that belongs to `uuid`.
- (void)tvrn_completeCallKitCallbackForUuid:(NSUUID *)uuid success:(BOOL)success {
    void (^callback)(BOOL) = self.callKitCompletionCallbacks[uuid.UUIDString];
    if (callback) {
        [self.callKitCompletionCallbacks removeObjectForKey:uuid.UUIDString];
        callback(success);
    }
}

- (void)providerDidReset:(CXProvider *)provider {
    id<TwilioVoiceForeignCallDelegate> foreign = [TwilioVoicePushRegistry foreignCallDelegate];
    if (foreign && [foreign respondsToSelector:@selector(twilioVoiceProviderDidReset:)]) {
        @try {
            [foreign twilioVoiceProviderDidReset:provider];
        } @catch (NSException *exception) {
            NSLog(@"[TwilioVoiceReactNative] Foreign delegate raised %@ on provider reset", exception.name);
        }
    }

    [TwilioVoiceReactNative twilioAudioDevice].enabled = NO;
    TVRNRecordAudioEvent(@"providerDidReset", nil);

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
    if (TVRNForeignClaimsAudioSession(provider, audioSession, YES)) {
        return;
    }
    [TwilioVoiceReactNative twilioAudioDevice].enabled = YES;
    @synchronized (TVRNLastDidActivateLock()) {
        TVRNLastDidActivateMs = TVRNNowMs();
    }
    TVRNRecordAudioEvent(@"didActivate", nil);
}

- (void)provider:(CXProvider *)provider didDeactivateAudioSession:(AVAudioSession *)audioSession {
    if (TVRNForeignClaimsAudioSession(provider, audioSession, NO)) {
        return;
    }
    [TwilioVoiceReactNative twilioAudioDevice].enabled = NO;
    TVRNRecordAudioEvent(@"didDeactivate", nil);
}

- (void)provider:(CXProvider *)provider performEndCallAction:(CXEndCallAction *)action {
    id<TwilioVoiceForeignCallDelegate> foreign = TVRNForeignOwnerOf(action.callUUID);
    if (foreign) {
        if ([foreign respondsToSelector:@selector(twilioVoiceProvider:performEndCallAction:)]) {
            @try {
                [foreign twilioVoiceProvider:provider performEndCallAction:action];
            } @catch (NSException *exception) {
                NSLog(@"[TwilioVoiceReactNative] Foreign delegate raised %@ on CXEndCallAction -- failing it", exception.name);
                [action fail];
            }
        } else {
            [action fail];
        }
        return;
    }

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
    if (TVRNRouteActionToForeign(provider, action, @selector(twilioVoiceProvider:performStartCallAction:))) {
        return;
    }

    [self tvrn_prepareAudioDeviceForCallWithUuid:action.callUUID];

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
    id<TwilioVoiceForeignCallDelegate> foreign = TVRNForeignOwnerOf(action.callUUID);
    if (foreign) {
        if ([foreign respondsToSelector:@selector(twilioVoiceProvider:performAnswerCallAction:)]) {
            @try {
                [foreign twilioVoiceProvider:provider performAnswerCallAction:action];
            } @catch (NSException *exception) {
                NSLog(@"[TwilioVoiceReactNative] Foreign delegate raised %@ on CXAnswerCallAction -- failing it", exception.name);
                [action fail];
            }
        } else {
            [action fail];
        }
        return;
    }

    [self tvrn_prepareAudioDeviceForCallWithUuid:action.callUUID];

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
    if (TVRNRouteActionToForeign(provider, action, @selector(twilioVoiceProvider:performSetHeldCallAction:))) {
        return;
    }

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
    id<TwilioVoiceForeignCallDelegate> foreign = TVRNForeignOwnerOf(action.callUUID);
    if (foreign) {
        if ([foreign respondsToSelector:@selector(twilioVoiceProvider:performSetMutedCallAction:)]) {
            @try {
                [foreign twilioVoiceProvider:provider performSetMutedCallAction:action];
            } @catch (NSException *exception) {
                NSLog(@"[TwilioVoiceReactNative] Foreign delegate raised %@ on CXSetMutedCallAction -- failing it", exception.name);
                [action fail];
            }
        } else {
            [action fail];
        }
        return;
    }

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
    if (TVRNRouteActionToForeign(provider, action, @selector(twilioVoiceProvider:performPlayDTMFCallAction:))) {
        return;
    }

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

    [self tvrn_completeCallKitCallbackForUuid:call.uuid success:YES];

    [self tvrn_watchForMissedActivationOnCall:call];
}

// Log-only (PRO-12171): a call that reached Connected but never saw
// provider:didActivateAudioSession: since its audio device was prepared is the
// suspected dead-air case. Record it after a grace period so the call report
// carries the proof. Deliberately does NOT force `enabled` -- under CallKit
// that is unvalidated and could break a call that is merely slow to activate.
- (void)tvrn_watchForMissedActivationOnCall:(TVOCall *)call {
    NSString *uuid = call.uuid.UUIDString;
    TVRNRecordAudioEvent(@"connected", uuid);
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(TVRNActivationGraceSeconds * NSEC_PER_SEC)),
                   dispatch_get_main_queue(), ^{
        TVOCall *live = self.callMap[uuid];
        if (!live || live.state != TVOCallStateConnected) {
            return;
        }
        NSNumber *preparedAt;
        @synchronized (TVRNPrepareTimes()) {
            preparedAt = TVRNPrepareTimes()[uuid];
            [TVRNPrepareTimes() removeObjectForKey:uuid];
        }
        // No device reset recorded (call waiting leaves the device alone): nothing to judge.
        double lastActivateMs;
        @synchronized (TVRNLastDidActivateLock()) {
            lastActivateMs = TVRNLastDidActivateMs;
        }
        if (!preparedAt || lastActivateMs >= preparedAt.doubleValue) {
            TVRNRecordAudioEvent(@"connected+3s", uuid);
            return;
        }
        RCTLogWarn(@"[TwilioVoiceReactNative] Call %@ Connected %.0fs ago, %.0fms after its audio device was reset, with no didActivateAudioSession -- expect dead air.",
                   uuid, TVRNActivationGraceSeconds, TVRNNowMs() - preparedAt.doubleValue);
        TVRNRecordAudioEvent(@"connected-without-didActivate", uuid);
    });
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

    [self tvrn_completeCallKitCallbackForUuid:call.uuid success:NO];
    [self.callKitProvider reportCallWithUUID:call.uuid endedAtDate:[NSDate date] reason:CXCallEndedReasonFailed];
    
    [self callDisconnected:call];
}

- (void)callDisconnected:(TVOCall *)call {
    // A call that ends without ever connecting must still settle its own
    // handler, or its JS promise / CallKit report hangs forever.
    [self tvrn_completeCallKitCallbackForUuid:call.uuid success:NO];
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
