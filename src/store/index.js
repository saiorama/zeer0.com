import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import AWS from 'aws-sdk'

Vue.use(Vuex)
const keyP1 = 'AKIA4R7E54', keyP2 = 'H5FG45VENW';
const DEMO_AWS_KEY = `${keyP1}${keyP2}`;
const SECRETp1 = '84NN9+x9uN9OVys2', SECRETp2 = '/A6ZqBgcwlFi8NEAz7CU1Dxi'
const DEMO_AWS_SECRET = `${SECRETp1}${SECRETp2}`;
const DEMO_AWS_REGION = `ap-south-1`;
const SES_REGIONS = {"regions":[{"id":"us-east-1","name":"US East","location":"N. Virginia","optIn":false,"visible":true},{"id":"us-east-2","name":"US East","location":"Ohio","optIn":false,"visible":true},{"id":"us-west-1","name":"US West","location":"N. California","optIn":false,"visible":true},{"id":"us-west-2","name":"US West","location":"Oregon","optIn":false,"visible":true},{"id":"af-south-1","name":"Africa","location":"Cape Town","optIn":true},{"id":"ap-east-1","name":"Asia Pacific","location":"Hong Kong","optIn":true},{"id":"ap-south-1","name":"Asia Pacific","location":"Mumbai","optIn":false,"visible":true},{"id":"ap-northeast-2","name":"Asia Pacific","location":"Seoul","optIn":false,"visible":true},{"id":"ap-southeast-1","name":"Asia Pacific","location":"Singapore","optIn":false,"visible":true},{"id":"ap-southeast-2","name":"Asia Pacific","location":"Sydney","optIn":false,"visible":true},{"id":"ap-northeast-1","name":"Asia Pacific","location":"Tokyo","optIn":false,"visible":true},{"id":"ca-central-1","name":"Canada","location":"Central","optIn":false,"visible":true},{"id":"eu-central-1","name":"Europe","location":"Frankfurt","optIn":false,"visible":true},{"id":"eu-west-1","name":"Europe","location":"Ireland","optIn":false,"visible":true},{"id":"eu-west-2","name":"Europe","location":"London","optIn":false,"visible":true},{"id":"eu-south-1","name":"Europe","location":"Milan","optIn":true},{"id":"eu-west-3","name":"Europe","location":"Paris","optIn":false,"visible":true},{"id":"eu-north-1","name":"Europe","location":"Stockholm","optIn":false,"visible":true},{"id":"me-south-1","name":"Middle East","location":"Bahrain","optIn":true,"visible":true},{"id":"sa-east-1","name":"South America","location":"São Paulo","optIn":false,"visible":true}]};
const DEMO_PRODUCT_LICENSE = `28B5E88E-F87041CA-9E5E58E6-59D5D985`;
const DEMO_PRODUCT_ID = `fZLjG`;
const API_GW_URL = 'https://api.zeer0.com/v001';
const LICENSE_ENDPOINT = "GRL";
const TEMPLATE_VARS_REGEX = /{{[\s]*[#/]?[a-zA-Z][a-zA-Z0-9.]*[\s]*[a-zA-Z0-9.]*[\s]*}}/g;
let store = new Vuex.Store({
  state: {
    accessKeyId: undefined,
    apiUrl: API_GW_URL,
    AWS: {
      SES: {
        ses: undefined,
        templates: undefined,
        template: undefined,
      }
    },
    awsCredentialsAreSet: undefined,
    demoAccessKeyId: DEMO_AWS_KEY,
    demoProductLicenseKey: DEMO_PRODUCT_LICENSE,
    demoSecretAccessKey : DEMO_AWS_SECRET,
    demoRegion: DEMO_AWS_REGION,
    deviceIsDesktop: undefined,
    licenseEndpoint: LICENSE_ENDPOINT,
    mustUseDemoCredentials: undefined,
    productLicense: undefined,
    productLicenseKey: undefined,
    productLicenseIsValid: undefined,
    region: "",
    secretAccessKey : undefined,
    sesRegions: SES_REGIONS,
    showDialogMessage: undefined,
    showDialogPlaceholder: undefined,
    showDialogCapturedValue: undefined,
    showMessageWithId: undefined,
    sidebarMustOpen: false,
    TEMPLATE_VARS_REGEX: TEMPLATE_VARS_REGEX,
  },
  mutations: {
    clearSESTemplates (state) {
      state.AWS.SES.templates = undefined;
      state.AWS.SES.template = undefined;
    },
    clearShowDialogSlots (state){
      state.showDialogMessage = undefined;
      state.showDialogPlaceholder = undefined;
    },
    clearShowMessageWithId (state){
      state.showMessageWithId = undefined;
    },
    initializeSESObject (state, refresh) {
      if(state.awsCredentialsAreSet &&
        (!state.AWS.SES.ses || refresh)){
        state.AWS.SES.ses = new AWS.SES({
          apiVersion: '2010-12-01',
          accessKeyId: state.accessKeyId,
          secretAccessKey: state.secretAccessKey,
          region: state.region
        });
      }
    },
    initializeStore(state) {
			// Check if the ID exists
			if(localStorage.getItem('store')) {
				this.replaceState(
					Object.assign(state, JSON.parse(localStorage.getItem('store')))
				);
			}
		},
    setCurrentTemplate (state, template){
      state.AWS.SES.template = template;
    },
    setShowDialogSlots (state, dialog){
      state.showDialogMessage = dialog.message || undefined;
      state.showDialogPlaceholder = dialog.placeholder || undefined;
    },
    toggleSidebarState (state){
      state.sidebarMustOpen = !state.sidebarMustOpen;
    },
    updateSESTemplatesList (state, moreTemplates){
      if(!state.AWS.SES.templates && moreTemplates) state.AWS.SES.templates = [];
      if(moreTemplates.TemplatesMetadata) state.AWS.SES.templates.push(...moreTemplates.TemplatesMetadata);
      state.AWS.SES.templates.NextToken = moreTemplates.NextToken || undefined;
      console.log(`SES templates = ${state.AWS.SES.templates}`);
    },
    updateStateKeyAndValue(state, newStateKeyAndValue){
      if(newStateKeyAndValue['key']){
        let key = newStateKeyAndValue['key'];
        let value = newStateKeyAndValue['value'] ?
                     newStateKeyAndValue['value']:undefined;
        if(Object.keys(state).includes(key)) state[key] = value;
        if(["accessKeyId",
          "secretAccessKey",
          "region", "productLicenseKey"].includes(key)){
            this.commit('clearSESTemplates');
          }
      }
    },
  },
  actions: {
    getProductLicense: async function(){
      const vm = this;
      this.state.productLicense = undefined;
      if(this.state.productLicenseKey && this.state.productLicenseKey.length > 0){
        return axios.get(`${API_GW_URL}/tools/license-check`, {
          params: {
            product: `${DEMO_PRODUCT_ID}`,
            license: vm.state.productLicenseKey,
            endpoint: LICENSE_ENDPOINT,
          },
        })
        .then(function (response) {
          vm.state.productLicense = response.data;
        })
        .catch(function (error) {
          vm.productLicense = error.data;
        })
        .finally(() => {
          vm.dispatch('validateLicense');
        });
      }
      this.dispatch('validateLicense');
    },
    validateLicense: function() {
      let x = this.state.productLicense && 
        this.state.productLicense.success && 
        !this.state.productLicense.purchase.subscription_cancelled_at && 
        !this.state.productLicense.purchase.subscription_failed_at;
      this.commit('updateStateKeyAndValue', {'key' : 'productLicenseIsValid', 'value':x});
    },
    getSESTemplates: async function() {
      this.commit('initializeSESObject', true);
      console.log(`ses = ${this.state.AWS.SES.ses}, ${this.state.AWS.SES.templates}`)
      if(this.state.AWS.SES.ses && this.state.productLicenseIsValid){
        var params = { MaxItems: 10 };
        if(!this.state.AWS.SES.templates || 
          (this.state.AWS.SES.templates && this.state.AWS.SES.templates.NextToken)){
            if(this.state.AWS.SES.templates && this.state.AWS.SES.templates.NextToken){
              params.NextToken = this.state.AWS.SES.templates.NextToken;
            }
            this.state.AWS.SES.ses.listTemplates(params)
            .promise()
            .then(templates => {
              console.log("Found templates", templates);
              this.commit('updateSESTemplatesList', templates);
            });
        }
      }
    },
    getSESTemplate: async function(context, tName){
      var params = { TemplateName: tName };
      this.commit('initializeSESObject', true);
      if(this.state.AWS.SES.ses && this.state.productLicenseIsValid){
        this.state.AWS.SES.ses.getTemplate(params)
        .promise()
        .then(response => {
          this.commit('setCurrentTemplate', response.Template);
        })
      }
    },
  },
  modules: {
  }
});

store.subscribe((mutation, state) => {
  let x = JSON.parse(JSON.stringify(state));
  //always write the sidebar state as `closed`
  //otherwise, the sidebar cannot be closed once opened
  x.sidebarMustOpen = false;
  //don't save product license, force an online check
  if(x.productLicense) delete x.productLicense;
  //always for create a new SES object and download templates
  if(x.AWS) delete x.AWS;
  localStorage.setItem("store", JSON.stringify(x));
});

export default store;