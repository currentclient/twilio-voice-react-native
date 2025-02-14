import {
  ConfigPlugin,
  AndroidConfig,
  withAndroidManifest,
  withInfoPlist,
  withXcodeProject,
  XcodeProject,
} from '@expo/config-plugins';

const COMMENT_KEY = /_comment$/;

function unquote(str: string) {
  if (str) {
    return str.replace(/^"(.*)"$/, '$1');
  }
}

function nonComments(obj: any): object {
  console.log('OBJ =', obj);
  const keys = Object.keys(obj);
  const newObj: any = {};

  for (let i = 0; i < keys.length; i++) {
    if (!COMMENT_KEY.test(keys[i])) {
      newObj[keys[i]] = obj[keys[i]];
    }
  }

  return newObj;
}

function ensureHeaderSearchPath(project: XcodeProject, file: string) {
  console.log({ project, file });
  const configurations: any = nonComments(
    project.pbxXCBuildConfigurationSection()
  );
  const INHERITED = '"$(inherited)"';

  for (const config in configurations) {
    const buildSettings = configurations[config].buildSettings;

    if (unquote(buildSettings.PRODUCT_NAME) !== project.productName) {
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

const withTwilioVoiceReactNativeHeaderSearchPath: ConfigPlugin = (config) => {
  const headerSearchPath =
    '"$(SRCROOT)/../node_modules/@twilio/voice-react-native-sdk/ios"';

  return withXcodeProject(config, (props) => {
    ensureHeaderSearchPath(props.modResults, headerSearchPath);
    return props;
  });
};

const withAndroidManifestService: ConfigPlugin = (expoConfig) =>
  // https://github.com/twilio/twilio-voice-react-native/blob/main/android/src/main/AndroidManifest.xml
  withAndroidManifest(expoConfig, (config) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults
    );

    if (!Array.isArray(app.service)) {
      app.service = [];
    }

    app.service.push({
      '$': {
        'android:name':
          'com.twiliovoicereactnative.VoiceFirebaseMessagingService',
        // "android:stopWithTask": "false",
        'android:exported': 'true',
      },
      'intent-filter': [
        {
          action: [
            { $: { 'android:name': 'com.google.firebase.MESSAGING_EVENT' } },
          ],
        },
      ],
    });

    app.service.push({
      $: {
        'android:name': 'com.twiliovoicereactnative.VoiceService',
        'android:foregroundServiceType': 'microphone',
        'android:exported': 'false',
      },
    });

    return config;
  });

const withTwilioVoice: ConfigPlugin = (config) => {
  config = withInfoPlist(config, (props) => {
    if (!Array.isArray(props.modResults.UIBackgroundModes)) {
      props.modResults.UIBackgroundModes = [];
    }

    if (!props.modResults.UIBackgroundModes.includes('audio')) {
      props.modResults.UIBackgroundModes.push('audio');
    }
    if (!props.modResults.UIBackgroundModes.includes('voip')) {
      props.modResults.UIBackgroundModes.push('voip');
    }

    if (!Array.isArray(props.modResults.NSUserActivityTypes)) {
      props.modResults.NSUserActivityTypes = [];
    }

    if (
      !props.modResults.NSUserActivityTypes.includes('INStartAudioCallIntent')
    ) {
      props.modResults.NSUserActivityTypes.push('INStartAudioCallIntent');
    }
    if (!props.modResults.NSUserActivityTypes.includes('INStartCallIntent')) {
      props.modResults.NSUserActivityTypes.push('INStartCallIntent');
    }

    return props;
  });

  config = withTwilioVoiceReactNativeHeaderSearchPath(config);

  config = AndroidConfig.Permissions.withPermissions(config, [
    'android.permission.DISABLE_KEYGUARD',
    'android.permission.INTERNET',
    'android.permission.POST_NOTIFICATIONS',
    'android.permission.USE_FULL_SCREEN_INTENT',
    'android.permission.WAKE_LOCK',
    'android.permission.FOREGROUND_SERVICE',
    'android.permission.FOREGROUND_SERVICE_MICROPHONE',
  ]);

  config = withAndroidManifestService(config);
  return config;
};

export default withTwilioVoice;
