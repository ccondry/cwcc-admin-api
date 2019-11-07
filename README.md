# dCloud CWCC API
This is HTTP REST API code for the dCloud Cisco Webex Contact Center v1 demo.
This API receives REST requests for admins to manage the CWCC demo. It is intended to be run on the mm and mm-dev VMs, as well as toolbox1 and toolbox2
in each dCloud datacenter. This service is called from the
toolbox-management-ui UI frontend website.

## Download
```sh
git clone git@github.com:ccondry/cwcc-admin-api.git
```

## Installation By Script
```sh
cd cwcc-admin-api
./install.sh
```

## Manually Run
```sh
npm start
```

## Manually Install as a Service on Linux
```sh
sudo cp systemd.service /lib/systemd/system/cwcc-admin-api.service
sudo systemctl enable cwcc-admin-api.service
```

## Manually Start Service on Linux
```sh
sudo systemctl start cwcc-admin-api.service
```
