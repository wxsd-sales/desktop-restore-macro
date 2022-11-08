/********************************************************
Copyright (c) 2022 Cisco and/or its affiliates.
This software is licensed to you under the terms of the Cisco Sample
Code License, Version 1.1 (the "License"). You may obtain a copy of the
License at
               https://developer.cisco.com/docs/licenses
All use of the material herein must be in accordance with the terms of
the License. All rights not expressly granted by the License are
reserved. Unless required by applicable law or agreed to separately in
writing, software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied.
*********************************************************
 * 
 * Macro Author:      	William Mills
 *                    	Technical Solutions Specialist 
 *                    	wimills@cisco.com
 *                    	Cisco Systems
 * 
 * Version: 1-0-4
 * Released: 11/01/22
 * 
 * This is a simple Webex Devices Macro which shows your local desktop 
 * after an answered call has closed it.
 * 
 * Full Readme and source code availabel on Github:
 * https://github.com/wxsd-sales/desktop-restore-macro
 * 
 ********************************************************/
import xapi from 'xapi';

/*********************************************************
 * Configure the settings below
**********************************************************/

const config = {
  showAlerts: true,         // true = show alert when the preview has been restored
  name: 'Desktop Restore',  // The title text shown on the alert
  layout: 'Prominent'       // The layout which is set after call is successful
}

/*********************************************************
 * Below contains all the call event listeners
**********************************************************/

let enabled = true;

// Once the call has been answered check if we should restore presentation
xapi.Event.CallSuccessful.on(async () => {
  if(!enabled){return}
  const defaultSource = await xapi.Config.Video.Presentation.DefaultSource.get()
  alert('Restoring Pres Preview from default source: ' + defaultSource);
  xapi.Command.Presentation.Start({ 
      ConnectorId: defaultSource, 
      SendingMode: 'LocalOnly'
    });
});

function alert(message){
  console.log('Alert: ' + message);
  if(!config.showAlerts){return}
    xapi.Command.UserInterface.Message.Alert.Display(
    { Duration: 5, Text: message, Title: config.name });
}

function processWidget(e) {
  console.log('Widget Event ' +e.WidgetId)
  if(e.Type !== 'changed' && e.WidgetId!='desktop-restore-widget'){return}
    if(e.Value == 'on') {
      console.log('Enabling feature')
      enabled = true;
    } else {
      console.log('Disabling feature')
      enabled = false;
    }
  
  syncUI();
}

function syncUI() {
  xapi.Command.UserInterface.Extensions.Widget.SetValue(
    { Value: (enabled) ? 'on' : 'off', WidgetId: 'desktop-restore-widget' });
  config.autoClose && xapi.Command.UserInterface.Extensions.Panel.Close()
}


function createPanel() {
  const panel = `
  <Extensions>
    <Version>1.9</Version>
    <Panel>
      <Location>HomeScreen</Location>
      <Icon>Camera</Icon>
      <Name>${config.name}</Name>
      <ActivityType>Custom</ActivityType>
      <Page>
          <Name>${config.name}</Name>
          <Options>hideRowNames=1</Options>
          <Row>
            <Widget>
              <WidgetId>desktop-restore-widget</WidgetId>
              <Type>ToggleButton</Type>
              <Options>size=1</Options>
            </Widget>
          </Row>
        </Page>
    </Panel>
  </Extensions>`;
  xapi.Command.UserInterface.Extensions.Panel.Save(
    { PanelId: 'desktop-restore' },
    panel
  ).then(() => syncUI())
}

createPanel();
xapi.Event.UserInterface.Extensions.Widget.Action.on(processWidget);
