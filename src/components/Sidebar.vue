<template>
  <section>
    <b-sidebar
      type="is-light"
      :fullheight="fullheight"
      :fullwidth="fullwidth"
      :overlay="overlay"
      :right="right"
      :on-cancel="closeSidebar"
      v-model="open"
    >
      <div class="p-1">
        <!-- <img
          src="https://raw.githubusercontent.com/buefy/buefy/dev/static/img/buefy-logo.png"
          alt="Lightweight UI components for Vue.js based on Bulma"
        /> -->
        <section class="content is-normal">
          <b-field>
            <b-switch v-model="mustUseDemoCredentials"><span class="has-background-dark has-text-white">Use Demo Credentials</span></b-switch>
          </b-field>
          <p class="has-text-centered p-3">--- OR ---</p>
          <b-field label="AWS Key" 
          :message="`***${accessKeyId.substring(accessKeyId.length - 5)}`">
              <b-input size="is-small" v-model="accessKeyId" type="password"></b-input>
          </b-field>
          <b-field label="AWS Secret"
          :message="`***${secretAccessKey.substring(secretAccessKey.length - 5)}`">
              <b-input size="is-small" v-model="secretAccessKey" type="password"></b-input>
          </b-field>
          <b-field label="Zeer0 License Key" :message="`${productLicenseKey.substring(0,5)}***`">
              <b-input size="is-small" v-model="productLicenseKey" type="password"></b-input>
          </b-field>
          <p v-if="productLicenseIsValid">
            <sup v-if="!demoAWSCredentialsAreInUse()">Thanks for using a licensed product!</sup>
            <sup v-else>Thanks for trying our demo! Subscribe <a href="/subscribe" target="_blank">here</a> </sup>
          </p>
          <p v-else><sup>Subscribe <a href="/subscribe" target="_blank">here</a></sup></p>
          <b-dropdown v-model="region" aria-role="list">
            <template #trigger="{ active }">
                <b-button outlined
                    :label="selectedRegion ? `${selectedRegion.name} - ${selectedRegion.location}` : 'Pick Your SES Region'"
                    type="is-primary"
                    icon-left = 'earth'
                    :icon-right="active ? 'menu-up' : 'menu-down'" />
            </template>
            <b-dropdown-item v-for="sesRegion in sesRegions.regions"
            aria-role="listitem" :selected="sesRegion.id === region" :value="sesRegion.id" :key="sesRegion.id">{{sesRegion.name}} - {{sesRegion.location}}</b-dropdown-item>
          </b-dropdown>
          <p v-if="!awsCredentialsAreSet"><sup>You will not be able to see your SES templates without your AWS credentials and a valid license are set. Btw, you can always use our demo license to test this tool.</sup></p>
        </section>
      </div>
    </b-sidebar>
  </section>
</template>

<script>

export default {
  data() {
    return {
        overlay: true,
        fullheight: false,
        fullwidth: false,
        right: true,
        sesRegions: this.$store.state.sesRegions || [], //immutable
    };
  },
  computed: {
    accessKeyId: {
      get: function() {return this.$store.state.accessKeyId || "" },
      set: function(neww) { this.$store.commit('updateStateKeyAndValue', {key: 'accessKeyId', value: neww}); },
    },
    awsCredentialsAreSet: { 
      get: function(){ return this.$store.state.awsCredentialsAreSet },
      set: function(neww) {
        this.$store.commit('updateStateKeyAndValue', {key: 'awsCredentialsAreSet', value: neww});
        if(neww && this.demoAWSCredentialsAreInUse()) {
          this.$store.commit('updateStateKeyAndValue', {key: 'sidebarMustOpen', value: !this.open});
        }
      },
    },
    mustUseDemoCredentials: { 
      get: function() {return this.$store.state.mustUseDemoCredentials },
      set: function(neww) {
        this.accessKeyId = neww ? this.$store.state.demoAccessKeyId : undefined;
        this.secretAccessKey = neww ? this.$store.state.demoSecretAccessKey : undefined;
        this.region = neww ? this.$store.state.demoRegion : undefined;
        this.productLicenseKey = neww ? this.$store.state.demoProductLicenseKey : undefined;
        this.$store.commit('updateStateKeyAndValue', {key: 'mustUseDemoCredentials', value: neww});
      },
    },
    open: {
      get: function() {return this.$store.state.sidebarMustOpen;},
      set: function(neww) {this.$store.commit('updateStateKeyAndValue', {key: 'sidebarMustOpen', value: neww});},
    },
    // overlay() { return this.awsCredentialsAreSet; },
    productLicenseIsValid: {
      get: function() { 
        return this.$store.state.productLicenseIsValid;
      },
    },
    productLicenseKey: {
      get: function() { return this.$store.state.productLicenseKey || ""; },
      set: function(neww) { this.$store.commit('updateStateKeyAndValue', {key: 'productLicenseKey', value: neww}); }
    },
    region: { 
      get: function() {return this.$store.state.region || undefined },
      set: function(neww) {this.$store.commit('updateStateKeyAndValue', {key: 'region', value: neww});}
    },
    secretAccessKey: {
      get: function() {return this.$store.state.secretAccessKey || "" },
      set: function(neww) {this.$store.commit('updateStateKeyAndValue', {key: 'secretAccessKey', value: neww});}
    },
    selectedRegion() { return this.$store.state.sesRegions.regions.find(r => r.id === this.region);},
  },
  watch: {
    accessKeyId: function(neww, old) {
      if(neww !== old){
        this.awsCredentialsAreSet = this.checkAWSCredentials();
      }
    },
    productLicenseIsValid: function(neww, old){
      if(neww !== old && neww){
        this.$store.commit('updateStateKeyAndValue', {'key': 'showMessageWithId', 'value': "THANKS_LICENSE"});
      }
    },
    productLicenseKey: function(neww, old) {
      if(neww !== old){
        this.awsCredentialsAreSet = this.checkAWSCredentials();
        this.$store.dispatch('getProductLicense');
      }
    },
    region: function(neww, old) {
      if(neww !== old){
        this.awsCredentialsAreSet = this.checkAWSCredentials();
      }
    },
    secretAccessKey: function(neww, old) {
      if(neww !== old){
        this.awsCredentialsAreSet = this.checkAWSCredentials();
      }
    },
  },
  methods: {
    checkAWSCredentials: function() {
      return this.accessKeyId && 
          this.secretAccessKey && 
          this.region && 
          this.accessKeyId.length > 0 && 
          this.secretAccessKey.length > 0 && 
          this.region.length > 0 &&
          this.productLicenseKey.length > 0;
    },
    demoAWSCredentialsAreInUse: function() {
      return this.accessKeyId === this.$store.state.demoAccessKeyId && 
          this.secretAccessKey === this.$store.state.demoSecretAccessKey && 
          this.region === this.$store.state.demoRegion &&
          this.productLicenseKey === this.$store.state.demoProductLicenseKey;
    },
    showAWSCredentialsMessage: function(){
      if(this.mustUseDemoCredentials) {
        this.open = !this.open;
      }
    },
    closeSidebar: function() {
      this.$store.commit('toggleSidebarState');
    },
  }
};
</script>

<style>
.p-1 {
  padding: 1em;
}
</style>
