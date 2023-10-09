import axios from 'axios';

// export default axios.create({ baseURL: 'http://192.168.1.14:8000'});
export const localServer = 'http://192.168.1.13:8088'

export const greenColor = "#A2F9AE"
export const redColor = "#FF7373"
export const standardColor = "#F0E2E2"
export const BlueColor ="#00BFFF"
export default axios.create({ baseURL: localServer });