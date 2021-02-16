<template>
    <div class="columns">
        <div class="column has-text-centered is-hidden-mobile" id="col-1" ref="col-1">
          <p v-if="!templates" class="content is-small has-text-grey has-text-weight-semibold">
            A list of your email templates will appear here
          </p>
          <div v-else class="is-size-7">
            <b-button :disabled="!moreTemplatesAreAvailable" 
            icon-left="refresh"
            class="p-2 is-text is-size-7"
            @click.prevent="getSESTemplates()">{{moreTemplatesAreAvailable ? 'Load More' : 'All Templates Loaded'}}
            </b-button>
            <b-collapse
              class="card"
              animation="slide"
              v-for="(template, index) of templates"
              :key="template.Name"
              :open="isOpen == index"
              @open="showTemplate(index)">
              <template #trigger="props">
                <div
                    class="card-header"
                    :class="{'has-background-light' : isOpen == index}"
                    role="button"
                >
                    <p class="card-header-title">
                        {{ template.Name }}
                    </p>
                    <a class="card-header-icon">
                        <b-icon
                            :icon="props.open ? 'menu-down' : 'menu-up'">
                        </b-icon>
                    </a>
                </div>
              </template>
              <div class="card-content">
                  <div class="content">
                    <p> Created: {{ friendlyDate(template.CreatedTimestamp) }}</p>
                    <b-button icon-left="shuffle-variant" @click.prevent="flipDisplayFormat" class=" is-size-7">Show {{!showTextVersion ? 'Text':'Html'}} Version</b-button>
                  </div>
              </div>
            </b-collapse>
          </div>
        </div>
        <div class="column is-three-fifths content is-small has-text-grey has-text-weight-semibold">
          <div class="is-hidden-mobile">
            <div v-if="!htmlPart && !textPart">
              <div v-if="templates && templates.length > 0">
                Select a template to view it here
              </div>
              <div v-else>
                Download and View your templates here
              </div>
            </div>
            <div v-else>
              <iframe style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100vh;width:100%;" height="100vh" width="100vw" v-bind:src="!showTextVersion ? htmlPart:textPart"/>
            </div>
          </div>
          <div class="is-hidden-desktop p-4" id="mobile-detector" ref="mobile-detector">
            <p>
              This page looks much nicer on desktop. May we ask you to visit us on a larger screen?
            </p>
          </div>
        </div>
        <div class="column is-hidden-mobile">
          <div class="content is-small">
            <p class="has-text-weight-semibold">HTML Template Variables</p>
            <p v-if="variables && variables.html">
              <b-tag v-for="(v, index) in Object.keys(variables.html)" :key=index
                closable
                close-icon="square-edit-outline"
                attached
                aria-close-label="Close tag"
                @close="showInputDialog(v)">
                {{v}}{{`${" = " + variables.html[v]["placeholder"] || "- (not set)"}`}}
              </b-tag>
            </p>
            <p v-else>-No html variables found-</p>
          </div>
          <div class="content is-small">
            <p class="has-text-weight-semibold">Text Template Variables</p>
            <p v-if="variables && variables.text">
              <b-tag v-for="(v, index) in Object.keys(variables.text)" 
                :key=index
                closable
                close-icon="square-edit-outline"
                attached
                aria-close-label="Close tag"
                @close="showInputDialog(v)">
                {{v}}{{`${" = " + variables.text[v]["placeholder"] || "- (not set)"}`}}
              </b-tag>
            </p>
            <p v-else>-No text variables found-</p>
          </div>
        </div>
        <b-modal v-model="sesStatsModalIsVisible">
            <div class="card content is-size-7">
              <div v-if="!sesStats">
                <span>We could not find any email send stats associated with your SES account</span>
              </div>
              <div v-else>
                <div class="table-container">
                  <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
                    <thead>
                      <h1>Email Send Statistics (last 15 days)</h1>
                      <tr>
                        <th>Date</th>
                        <th v-for="(key, idx) in sesStatsKeys" :key="idx">{{key}}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(sesStatDate, idx2) in this.sortAsDates(Object.keys(sesStats))" :key="idx2">
                        <td>{{sesStatDate}}</td>
                        <td v-for="(key, idx3) in sesStatsKeys" :key="idx3">{{sesStats[sesStatDate][key] ? sesStats[sesStatDate][key] : '-'}}</td>
                      </tr>
                    </tbody>
                    <!-- Your table content -->
                  </table>
                </div>
              </div>
            </div>
        </b-modal>
    </div>
</template>

<script>
import moment from 'moment';
import {zUtils} from './utils/utils'
export default {
  computed: {
    moreTemplatesAreAvailable() { 
        return !this.$store.state.AWS.SES.templates ||
            (this.$store.state.AWS.SES.templates &&
            this.$store.state.AWS.SES.templates.length > 0 && 
            this.$store.state.AWS.SES.templates.NextToken);
    },
    sesStats() {
        return this.$store.state.sesStats;
    },
    sesStatsKeys() {
        return this.$store.state.sesStatsKeys;
    },
    showDialogCapturedValue() {
      return this.$store.state.showDialogCapturedValue || "";
    },
    template() {
      return this.$store.state.AWS.SES.template || undefined;
    },
    templates(){
      return this.$store.state.AWS.SES.templates ? this.$store.state.AWS.SES.templates : undefined;
    },
  },
  data() {
    return {
      carouselImagesMobile: [
        { src: 'images/ses-1.png' },
        { src: 'images/ses-2.png' },
        { src: 'images/ses-3.png' },
        { src: 'images/ses-4.png' },
        { src: 'images/ses-5.png' }
      ],
      htmlPart: undefined,
      isOpen: undefined,
      sesStatsModalIsVisible: undefined,
      showTextVersion: false,
      textPart: undefined,
      variables: undefined,
    }
  },
  methods: {
    awsCredentialsAreSet() { return this.$store.state.awsCredentialsAreSet || false; },
    clearScreen: function() {
      this.htmlPart = this.isOpen = this.textPart = this.variables = undefined;
      this.isOpen = false;
    },
    flipDisplayFormat: function() {
      this.showTextVersion = !this.showTextVersion;
    },
    friendlyDate: (date) => {
      if(typeof date === 'string') date = new Date(date);
      return moment(date).fromNow();
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
    initializeVariables: function(type, withValues) {
      this.variables[type] = {};
      if(withValues){
        withValues.map(key => {
          this.variables[type][key] = {
            placeholder: undefined
          }
        })
      }
    },
    showInputDialog(value){
      this.$store.commit('setShowDialogSlots', {message: `Enter a value for ${value}`, placeholder: value});
    },
    showTemplate: function(index){
      this.isOpen = index;
      console.log(this.templates[index].Name);
      this.$store.dispatch('getSESTemplate', this.templates[index].Name);
    },
    updatePlaceholderInVariables(neww){
      if(this.variables.html[neww.key]) {
        let x = JSON.parse(JSON.stringify(this.variables.html));
        x[neww.key]["placeholder"] = neww.value;
        this.variables.html = JSON.parse(JSON.stringify(x));
      }
      if(this.variables.text[neww.key]) {
        let x = JSON.parse(JSON.stringify(this.variables.text));
        x[neww.key]["placeholder"] = neww.value;
        this.variables.text = JSON.parse(JSON.stringify(x));
      }
      let x = JSON.parse(JSON.stringify(this.variables));
      this.variables = x;
    }
  },
  mixins: [zUtils],
  mounted: function(){
    let deviceIsDesktop = this.$refs['mobile-detector'] ? false : true;
    console.log(`device is desktop - ${JSON.stringify(this.$refs)}`);
    this.$store.commit('updateStateKeyAndValue', {'key': 'deviceIsDesktop', 'value': deviceIsDesktop});
  },
  watch: {
    sesStats: function(neww){
        this.sesStatsModalIsVisible = neww ? true: false;
    },
    sesStatsKeys: function(neww){
        console.log(`new stats keys = ${neww}`);
    },
    showDialogCapturedValue: function(neww) {
      if(neww) this.updatePlaceholderInVariables(neww);
    },
    template: function(neww) {
      if(neww){
        let x = new Blob([neww.HtmlPart], { type: 'text/html' });
        this.htmlPart = URL.createObjectURL(x);
        x = new Blob([neww.TextPart], { type: 'text/html' });
        this.textPart = URL.createObjectURL(x);
        this.variables = {html: {}, text: {}};
        x = this.extractTemplateVariables(neww.HtmlPart);
        this.initializeVariables('html', x);
        x = this.extractTemplateVariables(neww.TextPart);
        this.initializeVariables('text', x);
        return;
      }
      return this.clearScreen();
    },
    templates: function(neww){
      console.log(`in Thorax, templates = ${neww}`);
      this.clearScreen();
      if(neww) this.showTemplate(0);
    },
    variables: function(neww){
      if(neww) {
        let html = this.template.HtmlPart;
        let text = this.template.TextPart;
        Object.keys(neww.html).map(key => {
          let placeholder = neww.html[key]["placeholder"];
          if(placeholder) {
            let res = this.stripHandlebarsAroundKey(html, key);
            html = res.join(key).replaceAll(key, placeholder);
          }
        });
        Object.keys(neww.text).map(key => {
          let placeholder = neww.text[key]["placeholder"];
          if(placeholder) {
            let res = this.stripHandlebarsAroundKey(text, key);
            text = res.join(key).replaceAll(key, placeholder);
          }
        });
        let x = new Blob([html], { type: 'text/html' });
        this.htmlPart = URL.createObjectURL(x);
        x = new Blob([text], { type: 'text/html' });
        this.textPart = URL.createObjectURL(x);
      }
    }
  },
};
</script>

<style type="text/css">
  @media only screen and (max-width: 760px) {
    #is-mobile-detector { display: none; }
  }
</style>