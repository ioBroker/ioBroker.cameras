# Older changes
## 3.0.1 (2026-08-16)
* (@GermanBluefox) Completely rewritten in TypeScript
* (@GermanBluefox) Added Ezviz cameras
* (@GermanBluefox) Snapshot requests are answered with `Cache-Control: no-store` so browsers cannot show a stale frame
* (@GermanBluefox) Fixed: a list of allowed IPs was never split correctly, so any list with more than one address rejected every request
* (@GermanBluefox) Fixed: connections from the IPv6 loopback address were not recognized as local
* (@GermanBluefox) Fixed: a failed image request could terminate the adapter with `ERR_HTTP_HEADERS_SENT`
* (@GermanBluefox) The cameras are reachable immediately after start instead of only after the first frame of every camera was grabbed
* (@GermanBluefox) The web extension picks up a changed key by itself, without restarting ioBroker.web
* (@paul179) Added `Steinel` cameras (as manufacturer of the universal camera type)
* (@GermanBluefox) The universal camera type now offers ~50 manufacturers with ~13000 models, each with a logo
* (ioBroker-Bot) Removed the deprecated `common.materialize` from io-package.json
* (ioBroker-Bot) Adapter requires js-controller >= 6.0.11 now
* (ioBroker-Bot) Adapter requires node.js >= 22 now
* (@GermanBluefox) Added `Instar` cameras
* (@GermanBluefox) Added optional go2rtc support for snapshots and live streams, proxied via the web adapter
* (@GermanBluefox) Fixed: the second viewer of the same camera did not receive any picture
* (@GermanBluefox) Added two widgets for ioBroker.devices: RTSP camera and snapshot camera
* (@GermanBluefox) Fixed: the `.running` state did not start or stop the stream
* (@GermanBluefox) Fixed: width/height/angle of the `image` message were ignored
* (@GermanBluefox) Fixed: a camera in the dialog of the snapshot widget was never used

## 2.1.2 (2024-07-15)
* (bluefox) Updated packages

## 2.1.1 (2024-07-07)
* (bluefox) Removed withStyles package

## 2.0.8 (2024-06-09)
* (bluefox) Packages updated
* (bluefox) Allowed selecting another source (with bigger resolution) for URL cameras

## 2.0.5 (2023-12-19)
* (bluefox) Minimal supported Node.js version is 18
* (bluefox) Corrected widgets

## 1.4.0 (2023-12-04)
* (bluefox) Changed widget set name
* (bluefox) Added the caching of images with time, size and rotation
* (bluefox) Added timeout for RTSP cameras

## 1.3.0 (2023-09-28)
* (bluefox) Utilized the new js-controller feature: sendToUI. RTSP Streaming works only with js-controller 5.0.13 or higher
* (bluefox) Implemented a second widget for simple cameras

## 1.2.3 (2023-09-27)
* (bluefox) Added WiWiCam MW1 and HiKam cameras

## 1.2.2 (2023-07-07)
* (bluefox) Corrected passwords with exclamation mark

## 1.2.1 (2023-07-06)
* (bluefox) Added eufy camera

## 1.1.1 (2023-03-15)
* (bluefox) Added Reolink E1 camera

## 1.0.3 (2023-01-11)
* (bluefox) Corrected GUI config error

## 1.0.2 (2023-01-07)
* (bluefox) added RTSP camera
* (bluefox) added cache of snapshots

## 0.2.0 (2022-09-27)
* (bluefox) GUI updated to MUIv5

## 0.1.8 (2022-02-13)
* (bluefox) replaced the deprecated package `request` with `axios`

## 0.1.5 (2022-02-13)
* (bluefox) Preparations for js-controller@4.x are made

## 0.1.4 (2021-07-13)
* (bluefox) Add a role for states

## 0.1.3 (2020-08-08)
* (Hirsch-DE) Parameters were applied

## 0.1.2 (2020-06-03)
* (bluefox) implemented get image by message

## 0.1.0
* (bluefox) URL and URL with basic authentication were implemented

## 0.0.1
* (bluefox) initial release
