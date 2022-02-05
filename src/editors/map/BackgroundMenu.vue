<template>
  <v-card>
    <v-card-title>Background</v-card-title>
    <v-checkbox
      dense
      v-model="selectArea"
      label="Select Area"
      @change="changeSelectArea"
    />
    <v-radio-group v-model="useSprite" @change="changeSprite">
      <v-radio label="empty" value="BACKGROUND" />
      <v-radio
        v-for="sprite of sprites"
        :key="sprite.name"
        :value="`BACKGROUND_${sprite.name}`"
      >
        <template v-slot:label>
          <img :src="getImage(sprite)" width="25" height="25" />
          &nbsp; - {{ sprite.name }}
        </template>
      </v-radio>
    </v-radio-group>
  </v-card>
</template>

<script lang="ts">
import LoggerFactory from "@/logger/LoggerFactory";
import Vue from "vue";
import SpriteConfig from "@/models/SpriteConfig";

export default Vue.extend({
  name: "BackgroundMenu",
  components: {},
  props: {
    sprites: Array,
  },
  data: () => ({
    logger: LoggerFactory.getLogger("Editors.Map.BackgroundMenu"),
    selectArea: false,
    useSprite: "",
  }),
  computed: {},
  methods: {
    changeSelectArea(value: boolean): void {
      this.$emit("change", { selectArea: value, sprite: this.useSprite });
    },
    changeSprite(value: string): void {
      this.$emit("change", { selectArea: this.selectArea, sprite: value });
    },
    getImage(config: SpriteConfig): string {
      return `${process.env.VUE_APP_BACKEND}${config.sprites[0]}`;
    },
  },
});
</script>
