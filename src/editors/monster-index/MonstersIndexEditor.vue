<template>
  <v-container>
    <div>Editor</div>
    <v-data-iterator :items="monsters" item-key="monsterId">
      <template v-slot:default="{ items, isExpanded, expand }">
        <v-row>
          <v-col
            v-for="item in items"
            :key="item.name"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card>
              <v-card-title>
                <h4>{{ item.monsterId }} - {{ item.name }}</h4>
              </v-card-title>
              <v-switch
                :input-value="isExpanded(item)"
                :label="isExpanded(item) ? 'Expanded' : 'Closed'"
                class="pl-4 mt-0"
                @change="(v) => expand(item, v)"
              ></v-switch>
              <v-divider></v-divider>
              <div v-if="isExpanded(item)" dense>
                <v-card>
                  <v-card-title>Animations</v-card-title>
                  <v-list
                    dense
                    v-for="animation in item.animationsSrc"
                    :key="animation.key"
                  >
                    <v-list-item>
                      <v-list-item-content>{{
                        animation.key
                      }}</v-list-item-content>
                      <v-list-item-content class="align-end">
                        {{ animation.metadata }}
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-data-iterator>
  </v-container>
</template>

<script lang="ts">
import { AnimationSrc } from "@/models/Animation";
import { MonsterIndex } from "@/models/Character";
import Vue from "vue";

export default Vue.extend({
  name: "MonstersIndexEditor",

  data: () => ({}),
  computed: {
    monsters(): MonsterIndex[] {
      return this.$store.state.monsterIndexEditor as MonsterIndex[];
    },
  },
});
</script>
