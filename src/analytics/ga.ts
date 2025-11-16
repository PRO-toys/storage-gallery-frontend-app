// src\analytics\ga.ts
import ReactGA from "react-ga4";

const ga_id = import.meta.env.VITE_GA_ID;

export const initGA = () => {
  if (ga_id) {
    ReactGA.initialize(ga_id);
  }
};

export const sendPageView = (path: string) => {
  if (ga_id) {
    ReactGA.send({ hitType: "pageview", page: path });
  }
};

export const sendEvent = (eventName: string, params: any = {}) => {
  if (ga_id) {
    ReactGA.event(eventName, params);
  }
};