import { PluginConfig } from "../../types.ts";

export interface WorldTemperatureConfig extends PluginConfig {
  openWeatherApiKey: string; // Additional config specific to WorldTemperature
}

export default class WorldTemperature {
  config: WorldTemperatureConfig;

  constructor(config: WorldTemperatureConfig) {
    this.config = config;
  }

  async loadPluginSpecificConfig(): Promise<void> {
    const __dirname = new URL(".", import.meta.url).pathname;
    const configPath = `${__dirname}config.json`;
    return Deno.readTextFile(configPath)
      .then(JSON.parse)
      .then((additionalConfig: Partial<WorldTemperatureConfig>) => {
        this.config = { ...this.config, ...additionalConfig };
      });
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

  async execute(latitude: number, longitude: number): Promise<number> {
    const apiUrl =
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.config.openWeatherApiKey}`;
    // make GET request to apiUrl
    let tempCelsius = 0;
    await fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        const tempKelvin = data.main.temp;
        tempCelsius = tempKelvin - 273.15;
        tempCelsius = Math.round(tempCelsius * 100) / 100;
      })
      .catch((error) => {
        console.error(error);
      });
    return tempCelsius;
  }
}
