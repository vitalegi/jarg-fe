<template>
  <v-dialog v-model="dialog" max-width="500">
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-model="model"
        :label="label"
        append-outer-icon="mdi-map-marker"
        readonly
        :dense="dense"
        v-bind="attrs"
        v-on="on"
      >
        <template v-slot:prepend>
          <v-btn color="primary" icon v-bind="attrs" v-on="on">
            <v-icon>mdi-account-search</v-icon>
          </v-btn>
        </template>
        <template v-slot:append-outer>
          <v-btn color="primary" icon @click="reset">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-text-field>
    </template>
    <v-card>
      <MonsterIndexSearch :monsters="monsters" size="small" v-slot="slotProps">
        <v-container dense>
          <v-row>
            <v-col
              cols="12"
              v-for="item in slotProps.items"
              :key="item.monsterId"
            >
              <v-card @click="(e) => select(item)">
                <v-card-title>
                  <b>{{ item.monsterId }}</b
                  >&nbsp;-&nbsp;{{ item.name }}
                </v-card-title>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </MonsterIndexSearch>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import MonsterIndex from "@/game-engine/monster/MonsterIndex";
import Vue from "vue";
import MonsterIndexSearch from "@/editors/monster-index/MonsterIndexSearch.vue";

export default Vue.extend({
  name: "SelectMonsterIndex",
  components: { MonsterIndexSearch },
  props: {
    label: {
      type: String,
      default: "Monster",
    },
    initialValue: {
      type: MonsterIndex,
    },
    initialValueId: {
      type: String,
    },
    dense: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({ dialog: false, model: "" }),
  computed: {
    monsters(): MonsterIndex[] {
      return this.$store.state.monsterIndexEditor as MonsterIndex[];
    },
  },
  methods: {
    select(monster: MonsterIndex): void {
      this.dialog = false;
      this.model = this.getLabel(monster);
      this.$emit("change", monster);
    },
    reset(): void {
      this.dialog = false;
      this.model = "";
      this.$emit("change", null);
    },
    getLabel(monster: MonsterIndex | null): string {
      if (monster) {
        return `${monster.monsterId} - ${monster.name}`;
      }
      return "";
    },
  },
  mounted(): void {
    let monster: MonsterIndex | null = null;
    if (this.initialValue) {
      monster = this.initialValue;
    }
    if (this.initialValueId) {
      const monsters = this.monsters.filter(
        (m) => m.monsterId === this.initialValueId
      );
      if (monsters.length > 0) {
        monster = monsters[0];
      }
    }
    this.model = this.getLabel(monster);
  },
});
</script>
