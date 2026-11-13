// El módulo 6.0.1 incluye un build.gradle anterior a AGP 8.
// Compilar sus fuentes Java con el plugin y el SDK de la aplicación anfitriona.
const fs = require('node:fs');
const path = require('node:path');
const root = path.dirname(require.resolve('react-native-sqlite-storage/package.json'));
const dir = path.join(root, 'platforms/android');
fs.writeFileSync(path.join(dir,'build.gradle'), `apply plugin: 'com.android.library'

android {
    namespace 'org.pgsqlite'
    compileSdk rootProject.ext.compileSdkVersion
    defaultConfig { minSdk rootProject.ext.minSdkVersion }
}

dependencies { implementation 'com.facebook.react:react-android' }
`);
