import"./virtual_mf-exposes___mfe_internal__DevicesWidgetCamerasSet__customDevices_js-ta6wGfT_.js";import"./virtual_mf-REMOTE_ENTRY_ID___mfe_internal__DevicesWidgetCamerasSet__customDevices_js-mbORQ5Xp.js";import{t as e}from"./Components-Ct6VZjeN.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var t=document.getElementById(`root`);t&&(t.innerHTML=`<pre style="font-family: monospace; padding: 16px">
This bundle is loaded by ioBroker.devices via Module Federation.

Exposed components:
${Object.keys(e).map(e=>`  - ${e}`).join(`
`)}

Build it with "npm run build" and let the devices adapter load
admin/dm-widgets/customDevices.js.
</pre>`);