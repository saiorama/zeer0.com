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
                    <b-navbar-dropdown label="SES" 
                        class="is-hidden-mobile">
                        <b-navbar-item href="#" 
                            class="button is-text is-small is-pulled-left "
                            @click.prevent="getSESTemplates()"
                            :disabled="!moreTemplatesAreAvailable || !awsCredentialsAreSet()">
                            View Templates
                        </b-navbar-item>
                        <b-navbar-item
                            @click.prevent="getSesStats()"
                            class="button is-text is-small is-pulled-left">
                            Email Stats
                        </b-navbar-item>
                        <hr class="dropdown-divider">
                        <b-navbar-item href="/templates/get.html" 
                            target="_blank"
                            class="button is-text is-small is-pulled-left">
                            Read Email (S3/public)
                        </b-navbar-item>
                    </b-navbar-dropdown>
                    <b-navbar-item href="https://gum.co/fZLjG" 
                        target="_blank"
                        class="is-hidden-mobile">
                            Subscribe
                    </b-navbar-item>
                </template>
                <template #end>
                    <b-navbar-item tag="div" 
                        class="is-hidden-mobile button is-dark p-2 m-2" 
                        @click = "toggleSidebar()">
                            AWS Credentials
                    </b-navbar-item>
                    <b-navbar-item
                        @click="privacyPolicyIsVisible = true"
                        class="is-hidden-mobile">
                            Privacy Policy
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
        <b-modal v-model="privacyPolicyIsVisible">
            <div class="card content is-size-7">
                <div class="card-content">
                    <div class="content">
                        <h1>Privacy Policy</h1>
                        <p>- We don't ever receive or store your AWS Key, secret, and region information. It is saved in your browser and sent directly to Amazon AWS to download information relevant to YOU!</p>
                        <p>- We use Google Analytics to see how our site is being used, not for advertising.</p>
                        <p>- That's it!</p>
                    </div>
                </div>
            </div>
        </b-modal>
    </div>
</template>

<script>
export default {
  data() {
    return {
        privacyPolicyIsVisible: undefined
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
    getSesStats: function() {
        if(!this.awsCredentialsAreSet()) {
            this.$store.commit('updateStateKeyAndValue', {'key': 'showMessageWithId', 'value': "AWS_MISSING"});
            return;
        }
        this.$store.dispatch('getSesStats');
    },
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