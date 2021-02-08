<template>
    <div class="columns">
        <div class="column"></div>
        <div class="column is-four-fifths">
            <b-navbar>
                <template #brand>
                    <b-navbar-item tag="router-link" :to="{ path: '/' }">
                        <img
                            src="@/assets/zeer0.png"
                            alt="Home"
                        >
                    </b-navbar-item>
                </template>
                <template #start>
                </template>
                <template #end>
                    <b-navbar-item href="#" class="is-hidden-mobile">
                        <a 
                        :disabled="!moreTemplatesAreAvailable || !awsCredentialsAreSet()"
                        @click="getSESTemplates()"
                        class="button is-text">
                            Get SES Templates
                        </a>
                    </b-navbar-item>
                    <b-navbar-item href="#" class="is-hidden-mobile">
                        <a href="https://zeer0.com/templates/get.html" 
                            target="_blank"
                            class="button is-text">
                            Read Email from S3_<b-icon icon="open-in-new"></b-icon>
                        </a>
                    </b-navbar-item>
                    <b-navbar-item tag="div" class="is-hidden-mobile">
                        <a class="button is-dark" @click = "toggleSidebar()">
                            AWS Credentials
                        </a>
                    </b-navbar-item>
                    <b-navbar-item href="#" class="is-hidden-mobile">
                        <a href="https://gum.co/fZLjG" 
                            target="_blank"
                            class="button is-text">
                            Subscribe
                        </a>
                    </b-navbar-item>
                    <b-navbar-item class="is-hidden-desktop">
                        <p class="is-size-7 has-text-weight-semibold">
                            This menu is disabled on mobile
                        </p>
                    </b-navbar-item>
                </template>
            </b-navbar>
        </div>
        <div class="column"></div>
    </div>
</template>

<script>
export default {
  data() {
    return {
    };
  },
  computed: {
    deviceIsDesktop(){ return this.$store.state.deviceIsDesktop; },
    moreTemplatesAreAvailable() { 
        return !this.$store.state.AWS.SES.templates ||
            (this.$store.state.AWS.SES.templates &&
            this.$store.state.AWS.SES.templates.length > 0 && 
            this.$store.state.AWS.SES.templates.NextToken);
    },
  },
  watch: {
    moreTemplatesAreAvailable: function(neww, old){
        if(neww !== old && !neww){
            this.$store.commit('updateStateKeyAndValue', {'key': 'showMessageWithId', 'value': "NO_MORE_TEMPLATES"});
        }
    },
    templates: function(neww, old){
        if(neww !== old || neww.length > old.length){
            this.$store.commit('updateStateKeyAndValue', {'key': 'showMessageWithId', 'value': "TEMPLATES_DOWNLOADED"});
        }
    }
  },
  methods: {
    awsCredentialsAreSet() { return this.$store.state.awsCredentialsAreSet || false; },
    getSESTemplates: function() {
        if(!this.awsCredentialsAreSet()) {
            this.$store.commit('updateStateKeyAndValue', {'key': 'showMessageWithId', 'value': "AWS_MISSING"});
            return;
        }
        if(this.moreTemplatesAreAvailable) {
            this.$store.dispatch('getSESTemplates');
        } else {
            this.$store.commit('updateStateKeyAndValue', {'key': 'showMessageWithId', 'value': "NO_MORE_TEMPLATES"});
        }
    },
    toggleSidebar: function(){
        this.$store.commit('toggleSidebarState');
    },
  },
};
</script>