import { AppConfig, PluginConfig } from "./types.ts";
import { loadPluginConfigFile } from "./config.ts";

async function getPlugin(pluginPath: string, config: PluginConfig) {
  const pluginModule = await import(pluginPath);
  const PluginClass = pluginModule.default;
  const pluginInstance = new PluginClass(config);

  return pluginInstance;
}

export async function getPlugins(config: AppConfig) {
  const pluginsConfig = config.plugins;

  const plugins: Map<string, object> = new Map();

  for (const pluginInfo of pluginsConfig) {
    const pluginConfigPath = `./plugins/${pluginInfo.name}/config.json`;
    const pluginConfig = await loadPluginConfigFile(
      pluginConfigPath,
    ) as PluginConfig;

    const plugin = await getPlugin(pluginInfo.path, pluginConfig);

    plugins.set(pluginInfo.name, plugin);
  }

  return plugins;
}
