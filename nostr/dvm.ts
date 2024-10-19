import { EventTemplate, VerifiedEvent } from "npm:nostr-tools";
import { arrayToKeyedObject } from "../utils.ts";

export function getServiceAnnouncementEvent(
  name: string,
  about: string,
  serviceAnnouncementTags?: { [key: string]: string[] },
): EventTemplate {
  const eventContent = JSON.stringify({
    "name": name,
    "about": about,
  });
  return {
    kind: 31990,
    created_at: Math.floor(Date.now() / 1000),
    content: eventContent,
    tags: [
      ["k", "5107"],
      ...Object.entries(serviceAnnouncementTags || {}).map(([key, value]) => {
        return [key, ...value];
      }),
    ],
  };
}

export class JobRequestInputTag {
  private _data: string;
  private _inputType: string;
  private _relay: string;

  constructor(data: string, inputType: string, relay: string) {
    this._data = data;
    this._inputType = inputType;
    this._relay = relay;
  }

  get method(): string {
    const dataObj = JSON.parse(this._data);
    return dataObj[0].method;
  }

  get params(): { [key: string]: string } {
    const dataObj = JSON.parse(this._data);
    const params = arrayToKeyedObject(dataObj[0].params);
    return params;
  }

  // Getter for data
  get data(): string {
    return this._data;
  }

  // Setter for data
  set data(value: string) {
    this._data = value;
  }

  // Getter for inputType
  get inputType(): string {
    return this._inputType;
  }

  // Setter for inputType
  set inputType(value: string) {
    this._inputType = value;
  }

  // Getter for relay
  get relay(): string {
    return this._relay;
  }

  // Setter for relay
  set relay(value: string) {
    this._relay = value;
  }
}

export function getJobRequestInputTag(
  jobRequestEvent: EventTemplate,
): JobRequestInputTag {
  const inputTag = jobRequestEvent.tags.find((tag) => tag[0] === "i");
  if (!inputTag) {
    throw new Error("No i tag found in the event");
  }

  const jobRequestParams: JobRequestInputTag = new JobRequestInputTag(
    inputTag[1] ? inputTag[1] : "",
    inputTag[2] ? inputTag[2] : "",
    inputTag[3] ? inputTag[3] : "",
  );

  return jobRequestParams;
}

export function getJobResultEvent(
  jobRequestEvent: VerifiedEvent,
  payload: string,
): EventTemplate {
  const jobRequestInputData: JobRequestInputTag = getJobRequestInputTag(
    jobRequestEvent,
  );

  const eventContent: EventTemplate = {
    content: payload,
    kind: 6107,
    tags: [
      ["request", jobRequestInputData.data],
      ["e", jobRequestEvent.id, jobRequestInputData.relay],
      ["i", jobRequestEvent.tags[0][1]],
      ["p", jobRequestEvent.pubkey],
    ],
    created_at: Math.floor(Date.now() / 1000),
  };
  return eventContent;
}
