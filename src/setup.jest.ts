// 
import 'fake-indexeddb/auto';
// Polyfill para structuredClone em ambientes de teste (Jest)
global.structuredClone = (val) => JSON.parse(JSON.stringify(val));

import { setupZoneTestEnv} from "jest-preset-angular/setup-env/zone"
setupZoneTestEnv();