import { PluginConfig } from "../../types.ts";

export default class Switch {
  config: PluginConfig;

  constructor(config: PluginConfig) {
    this.config = config;
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

  execute(state: number): number {
    // IRL logic to toggle the switch
    // cast state to number and return
    return state;
  }
}
