import {
  finalizeEvent,
  getPublicKey,
  SimplePool,
  VerifiedEvent,
} from "npm:nostr-tools";
import { hexToBytes } from "npm:@noble/hashes/utils";
import { loadConfigFile } from "./config.ts";
import {
  getJobRequestInputTag,
  getJobResultEvent,
  getServiceAnnouncementEvent,
  JobRequestInputTag,
} from "./nostr/dvm.ts";
import { AppConfig } from "./types.ts";
import { getPlugins } from "./plugins.ts";

const appConfig = await loadConfigFile("./config.json") as AppConfig;
const plugins = await getPlugins(appConfig);

const sk = hexToBytes(appConfig.privateKey);
const pk = getPublicKey(sk);

const pool = new SimplePool();

// for each plugin, publish a service announcement event for the plugin's capability
for (const plugin of plugins) {
  const pluginObj = plugin[1];
  const serviceAnnouncementEvent = getServiceAnnouncementEvent(
    pluginObj.getName(),
    pluginObj.getAbout(),
    pluginObj.getServiceAnnouncementTags(),
  );
  const signedEvent = finalizeEvent(serviceAnnouncementEvent, sk);
  console.log("publishing service announcement event.");
  await Promise.any(pool.publish(appConfig.relays, signedEvent));
}

/**
 * Handle a DVM job request
 * @param event
 */
const handleJobRequest = async (event: VerifiedEvent) => {
  const jobRequestInputData: JobRequestInputTag = getJobRequestInputTag(event);

  console.log(`Received job request for: ${jobRequestInputData.method}`);

  switch (jobRequestInputData.method) {
    case "getTemperature": {
      console.log("Handling getTemperature request");
      const temp = plugins.get("temperature").execute();
      const jobResult = getJobResultEvent(event, temp.toString());
      const signedEvent = finalizeEvent(jobResult, sk);
      await Promise.any(pool.publish(appConfig.relays, signedEvent));
      console.log("Published job result event");
      break;
    }
    case "runMotor": {
      console.log("Handling runMotor request");
      const params = jobRequestInputData.params;
      const runDuration = params.value;
      const result = plugins.get("run-motor").execute(runDuration);
      const jobResult = getJobResultEvent(event, result);
      const signedEvent = finalizeEvent(jobResult, sk);
      await Promise.any(pool.publish(appConfig.relays, signedEvent));
      break;
    }
    default: {
      console.log("Unknown method", jobRequestInputData.method);
    }
  }
};

pool.subscribeMany(
  appConfig.relays,
  [
    {
      "kinds": [5107],
      "#p": [pk],
      "limit": 0,
    },
  ],
  {
    onevent(event) {
      // cast the event to a VerifiedEvent
      const verifiedEvent = event as VerifiedEvent;
      handleJobRequest(verifiedEvent);
    },
    oneose() {
      console.log("EOSE");
    },
  },
);
