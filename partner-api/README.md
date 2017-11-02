
# Summary

Simple command line utility for Node.js that demonstrates how to use the Xealth Partner API.

## Setup

 * Download and install [Node.js](https://nodejs.org/en/download/)

 * Install modules (you only need to do this once)

```
  cd xealth-partner-sample-code/partner-api
  npm install

```

     Note: this also creates `config.yaml` if it doesn't exist (see next step)

 * Edit `config.yaml` with the following

     1. partnerid
     1. your key and secret
     1. your patient registration endpoint (if you have one setup)
     1. your monitor view endpoints (if you have them setup)
     1. the xealth server you want to use

     Note: you can leave the bogus endpoint URLs and still run the examples. You'll just see some resolver errors.

 * Compile the code

```
   gulp lib
 ```

  This compiles code in ./src and outputs to ./lib. Basically it runs babel and strips out the flow type checking.
  You do not need to run this when updating your config.yaml.

 * Run the script

```
  ./run
```

  This is just a wrapper that calls `node ./lib/index.js`

  To see more verbose output pass `-v` or `-vv`.

## Examples

### Demos

These are some simple API usage demos. You can feel free to try them out against our test server.


* Partner calling Xealth to create and delete a profile

```
./run demo profile
```


* Xealth calling your monitor endpoints using the patient information set in `config.yaml`


```
./run demo monitor
```


* Partner registering a patient registration endpoint then calling test api to callback the partner patient registration endpoint


```
./run demo register
```


* Partner calling Xealth to create and delete a preorder endpoint


```
./run demo preorder
```

* Partner calling Xealth to create and delete a preorder forms


```
./run demo forms
```


### Setting an alert for your program

Here is how you can try out the alert API.

First you need to order/prescribe a program in DigitalCare.


- Open a DigitalCare test link. For example:

 ```
 https://digitalcare-dev.xealth.io/?d=shslab&p=Z4153431&csn=200021806&data=<encrypted_signature_contact_xealth>
```
 In the example, the link is pointing to our dev server (`digitalcare-dev.xealth.io`) and using the test deployment "shslab" with patient "Z4153431". This deployment and patient id should match the values in the config.yaml.

 This link also containsa an encrypted signature to authenticate the call. Please contact Xealth.

 Please contact Xealth for an updated URL that works for your environment.

- Search for one of your partner programs and order it. The order will be associated with a pre-configured program id as agreed upon by Xealth and the partner. (If you only have one program it probabably will be "1".)

Now you can set an alert for the prescribe program. There are two ways to do this.

##### 1. Using XPDAT sent to your patient registration endpoint

If you are configured to receive a call to your patient registration endpoint when an order is placed with Xealth you will receive an xpdat (token) associated with the patient and program. You can now use that to set an alert.

For example, to set an alert for 60 seconds for the patient:program just prescribed:

```
 ./run patient alert -s 60 <xpdat>
```

##### 1. Using XPDAT returned from patient enrollment API.

If you are not implementing the patient registration endpoint (or don't want to hunt for the XPDAT in your database or server logs) you should enroll the patient with Xealth to obtain an XPDAT. In this case the token is not associated with a specific program.

```
 ./run patient enroll
```

You can now use that to set an alert. In this case you need to specify the program id (assumed to be 1 here).

```
./run patient alert --programId 1 <xpdat> -s 60
```

At this point DigitalCare should show the alert. After a minute it should go away.


To reset the alert pass "-s 0" (0 seconds) using the commands above.

##### Troubleshooting

1. 404 (NOT_FOUND) likely means the program id is not valid (because you specified the wrong program id, prescribed the wrong program, etc.)
2. 400 (BAD_REQUEST) likely means you need to specify the program id (if you are using an XPDAT returned from our enrollment API)

## Multiple configs

If you would like to test switching among multiple configs one approach is the following.

1. Create a directory for your configs and link `config.yaml` to the one you want to use by default (here called `config1.yaml`).

 ```
mkdir configs
cp config.yaml ./configs/config1.yaml
ln -sf ./configs/config1.yaml config.yaml
```

 Since by default the script looks for `./config.yaml` the above will result in `./configs/config1.yaml` being found via symbolic link when no config path is specified on the command line.

1. Create other configs (e.g. `config1.yaml` and `config2.yaml`) in the newly created config directory
1. Pass the config name to the command. For example, to run the profile api example using a different config each time:

  ```
 	./run -c ./configs/config1.yaml demo profile
 	./run -c ./configs/config2.yaml demo profile
 ```

