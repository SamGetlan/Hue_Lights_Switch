import axios, { AxiosResponse } from 'axios';

const url = 'http://192.168.42.75';
let username: string;
let lights: string[] = [];

interface ConnectionResponse {
  error?: ConnectError;
  success?: ConnectSuccess;
}

interface ConnectError {
  address: string;
  description: string;
  type: number;
}

interface ConnectSuccess {
  username: string;
}

interface LightState {
  on: boolean;
  bri: number;
  hue: number;
  sat: number;
  effect: string;
  xy: [number, number],
  ct: number;
  alert: string;
  colormode: string;
  mode: string;
  reachable: boolean;
}

interface LightSwupdate {
  state: string;
  lastinstall: string;
}

interface LightControl {
  mindimlevel: number;
  maxlumen: number;
  colorgamuttype: string;
  colorgamut: [number, number][];
  ct: {
    min: number;
    max: number;
  };
}

interface LightCapabilities {
  certified: boolean;
  control: LightControl;
  streaming: {
    renderer: boolean;
    proxy: boolean;
  }
}

interface LightConfig {
  archetype: string;
  function: string;
  direction: string;
  startup: {
    mode: string;
    configured: boolean;
  }
}

interface LightInfo {
  state: LightState;
  swupdate: LightSwupdate;
  type: string;
  name: string;
  modelid: string;
  manufacturername: string;
  productname: string;
  capabilities: LightCapabilities;
  config: LightConfig;
  uniqueid: string;
  swversion: string;
  swconfigid: string;
  productid: string;
}

interface LightInfoResponse {
  [lightId: string]: LightInfo;
}

const errorResponse = (error: any) => {
  console.error(`There was an error: ${error}`);
}

const connect = async () => {
  try {
    const axiosResponse: AxiosResponse<ConnectionResponse[]> = await axios.post(`${url}/api`, { "devicetype": "my_hue_app#rasp pi" });
    const { error, success } = axiosResponse.data[0];
    if (error && error.type === 101) {
      alert('Please press the Hue Bridge to connect');
    }
    if (success) {
      username = success.username;
    }
  } catch (e) {
    errorResponse(e);
  }
}

const getLights = async () => {
  try {
    const response: AxiosResponse<LightInfoResponse> = await axios.get(`${url}/api/${username}/lights`);
    const { data } = response;
    for (const lightId in data) {
      lights.push(lightId);
    }
  } catch (e) {
    errorResponse(e);
  }
}

const switchLights = async (on: boolean) => {
  try {
    if (!lights.length) {
      await getLights();
    }
    lights.forEach((id: string) => {
      const putBody = {on};
      axios.put(`${url}/api/${username}/lights/${id}/state`, putBody)
    });
  } catch (e) {
    errorResponse(e);
  }
}

document.querySelector('#connect-button').addEventListener('click', connect);
document.querySelector('#lights-on-button').addEventListener('click', () => switchLights(true));
document.querySelector('#lights-off-button').addEventListener('click', () => switchLights(false));