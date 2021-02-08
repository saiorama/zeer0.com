<template>
<div></div>
</template>

<script>
const MESSAGES = {
  "TEMPLATES_DOWNLOADED": "Templates downloaded",
  "NO_MORE_TEMPLATES": "All available templates have been downloaded",
  "THANKS_LICENSE": 'Thanks for using a licensed product!',
  "AWS_MISSING": 'AWS credentials are required for this feature to work',
}
export default {
  data() {
    return {
    };
  },
  computed: {
    showMessageWithId: function(){ 
      return this.$store.state.showMessageWithId;
    },
    showDialogMessage: function(){
      return this.$store.state.showDialogMessage;
    },
    showDialogPlaceholder: function(){
      return this.$store.state.showDialogPlaceholder;
    },
  },
  watch: {
    showMessageWithId: function(neww){
      if(neww && Object.keys(MESSAGES).includes(neww)){
        this.showSnackbar(MESSAGES[neww]);
      }
    },
    showDialogPlaceholder: function(neww, old){
      if(neww !== old){
        this.showDialog(neww);
      }
    },
  },
  methods: {
    showSnackbar : function(msg, type, actionText){
      if(msg){
        this.$buefy.notification.open({
          message: msg || '',
          type: type || 'is-info',
          position: 'is-bottom',
          actionText: actionText,
          indefinite: false,
          duration: 3.5*1000, //ten seconds
          onAction: () => {
            // this.$toast.open({
              //     message: 'Action pressed',
              //     queue: false
              // })
          }
        });
        this.$store.commit('clearShowMessageWithId');
      }
    },
    showDialog: function(placeholder) {
      if(placeholder){
        let vm = this;
        this.$buefy.dialog.prompt({
          message: this.showDialogMessage,
          inputAttrs: {
              placeholder: placeholder
          },
          trapFocus: true,
          onConfirm: (value) => {
            vm.$store.commit('updateStateKeyAndValue', {key: 'showDialogCapturedValue', value: {key:placeholder, value: value }});
            this.$buefy.toast.open(`You entered: ${value}`);
            vm.$store.commit('clearShowDialogSlots');
          },
          onCancel: (val) => {
            console.log(val);
            vm.$store.commit('clearShowDialogSlots');
          }
        })
      }
    }
  }
};
</script>

<style>
.p-1 {
  padding: 1em;
}
</style>
