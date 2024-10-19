import { PluginConfig } from "../../types.ts";
import { WorldTemperatureConfig } from "../world-temperature/main.ts";

export default class TemperatureSensor {
  config: PluginConfig;

  constructor(config: PluginConfig) {
    this.config = config;
  }

  async loadPluginSpecificConfig(): Promise<void> {
    return Promise.resolve();
  }

  getName(): string {
    return this.config.name;
  }

  getAbout(): string {
    return this.config.about;
  }

  getCapability(): string {
    return this.config.capability;
  }

  getEventTags(): { [key: string]: string[] } {
    return this.config.eventTags || {};
  }

  getServiceAnnouncementTags(): { [key: string]: string[] } {
    return this.config.serviceAnnouncementTags || {};
  }

  execute(): number {
    const temp = Math.random() * 100;
    return Math.round(temp * 100) / 100;
  }
}
