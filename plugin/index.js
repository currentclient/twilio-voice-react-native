/**
 * Expo config plugin for @twilio/voice-react-native-sdk (CurrentClient fork).
 *
 * Encapsulates every native-project mutation the SDK needs so consuming apps
 * do not have to maintain their own config plugin:
 *
 * iOS
 *  - Info.plist: UIBackgroundModes (audio, voip)
 *  - Info.plist: NSUserActivityTypes (INStartAudioCallIntent, INStartCallIntent)
 *  - Xcode project: HEADER_SEARCH_PATHS entry for the SDK's ios/ directory
 *
 * Android
 *  - uses-permission entries required for calling / foreground services
 *  - <service> entry for com.twiliovoicereactnative.VoiceService
 *  - optional <service> entries supplied by the app (custom Firebase
 *    messaging service, phone-call foreground service) via plugin props
 *
 * Props (all optional):
 *  {
 *    "android": {
 *      // Fully-qualified class name of an app-provided
 *      // FirebaseMessagingService that handles Twilio VoIP pushes.
 *      // Registered with the com.google.firebase.MESSAGING_EVENT intent
 *      // filter, exported=true, stopWithTask=false.
 *      "messagingServiceClass": "com.example.app.voip.CustomVoIPMessagingService",
 *
 *      // App-provided foreground service with type "phoneCall"
 *      // (e.g. a media-session service used during active calls).
 *      "phoneCallServiceClass": "com.example.app.voip.CallMediaSessionService",
 *      "phoneCallServiceStopWithTask": true
 *    }
 *  }
 */
const {
  AndroidConfig,
  createRunOncePlugin,
  withAndroidManifest,
  withInfoPlist,
  withXcodeProject,
} = require('expo/config-plugins');

const pkg = require('../package.json');

const IOS_BACKGROUND_MODES = ['audio', 'voip'];
const IOS_USER_ACTIVITY_TYPES = ['INStartAudioCallIntent', 'INStartCallIntent'];
const IOS_HEADER_SEARCH_PATH =
  '"$(SRCROOT)/../node_modules/@twilio/voice-react-native-sdk/ios"';

const ANDROID_PERMISSIONS = [
  'android.permission.DISABLE_KEYGUARD',
  'android.permission.INTERNET',
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.USE_FULL_SCREEN_INTENT',
  'android.permission.VIBRATE',
  'android.permission.WAKE_LOCK',
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.FOREGROUND_SERVICE_MICROPHONE',
  'android.permission.FOREGROUND_SERVICE_PHONE_CALL',
  'android.permission.MANAGE_OWN_CALLS',
];

const withVoiceInfoPlist = (config) =>
  withInfoPlist(config, (mod) => {
    const plist = mod.modResults;

    if (!Array.isArray(plist.UIBackgroundModes)) {
      plist.UIBackgroundModes = [];
    }
    for (const mode of IOS_BACKGROUND_MODES) {
      if (!plist.UIBackgroundModes.includes(mode)) {
        plist.UIBackgroundModes.push(mode);
      }
    }

    if (!Array.isArray(plist.NSUserActivityTypes)) {
      plist.NSUserActivityTypes = [];
    }
    for (const type of IOS_USER_ACTIVITY_TYPES) {
      if (!plist.NSUserActivityTypes.includes(type)) {
        plist.NSUserActivityTypes.push(type);
      }
    }

    return mod;
  });

const COMMENT_KEY = /_comment$/;

function unquote(str) {
  return str ? str.replace(/^"(.*)"$/, '$1') : str;
}

function ensureHeaderSearchPath(project, file) {
  const section = project.pbxXCBuildConfigurationSection();
  const INHERITED = '"$(inherited)"';

  for (const key of Object.keys(section)) {
    if (COMMENT_KEY.test(key)) {
      continue;
    }
    const buildSettings = section[key].buildSettings;
    if (!buildSettings || unquote(buildSettings.PRODUCT_NAME) !== project.productName) {
      continue;
    }
    if (!buildSettings.HEADER_SEARCH_PATHS) {
      buildSettings.HEADER_SEARCH_PATHS = [INHERITED];
    }
    if (!buildSettings.HEADER_SEARCH_PATHS.includes(file)) {
      buildSettings.HEADER_SEARCH_PATHS.push(file);
    }
  }
}

const withVoiceHeaderSearchPath = (config) =>
  withXcodeProject(config, (mod) => {
    ensureHeaderSearchPath(mod.modResults, IOS_HEADER_SEARCH_PATH);
    return mod;
  });

const withVoiceAndroidManifest = (config, androidProps = {}) =>
  withAndroidManifest(config, (mod) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(mod.modResults);

    if (!Array.isArray(app.service)) {
      app.service = [];
    }

    const ensureService = (service) => {
      const exists = app.service.some(
        (existing) => existing.$ && existing.$['android:name'] === service.$['android:name']
      );
      if (!exists) {
        app.service.push(service);
      }
    };

    if (androidProps.messagingServiceClass) {
      ensureService({
        $: {
          'android:name': androidProps.messagingServiceClass,
          'android:stopWithTask': 'false',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'com.google.firebase.MESSAGING_EVENT' } }],
          },
        ],
      });
    }

    if (androidProps.phoneCallServiceClass) {
      const service = {
        $: {
          'android:name': androidProps.phoneCallServiceClass,
          'android:foregroundServiceType': 'phoneCall',
          'android:exported': 'false',
        },
      };
      if (androidProps.phoneCallServiceStopWithTask !== undefined) {
        service.$['android:stopWithTask'] = String(
          androidProps.phoneCallServiceStopWithTask
        );
      }
      ensureService(service);
    }

    // Declared in the SDK's own AndroidManifest.xml as well; re-declared here
    // so the merged app manifest carries the foregroundServiceType explicitly.
    ensureService({
      $: {
        'android:name': 'com.twiliovoicereactnative.VoiceService',
        'android:foregroundServiceType': 'microphone',
        'android:exported': 'false',
      },
    });

    return mod;
  });

const withTwilioVoiceReactNative = (config, props = {}) => {
  config = withVoiceInfoPlist(config);
  config = withVoiceHeaderSearchPath(config);
  config = AndroidConfig.Permissions.withPermissions(config, ANDROID_PERMISSIONS);
  config = withVoiceAndroidManifest(config, props.android);
  return config;
};

module.exports = createRunOncePlugin(withTwilioVoiceReactNative, pkg.name, pkg.version);
