// The blueprint theme. `astryx experimental theme editor` wrote this file once and never changes it again.
// The checked settings live in blueprint.settings.json and the generated blueprint.settings.ts;
// change them with `astryx experimental theme editor set blueprint ...`. Add your own changes below: they win over the settings.
import {defineTheme} from '@astryxdesign/core/theme';
import {blueprintSettings} from './blueprint.settings';

export const blueprintTheme = defineTheme({
  extends: blueprintSettings,
  name: 'blueprint',
});
