<template>
  <v-container>
    <v-row>
      <v-col>
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">Stat</th>
                <th class="text-left">Strongest</th>
                <th class="text-left">Class</th>
                <th class="text-left">Lv. 50</th>
                <th class="text-left">2^ Strongest</th>
                <th class="text-left">Class</th>
                <th class="text-left">Lv. 50</th>
                <th class="text-left">2^ Weakest</th>
                <th class="text-left">Class</th>
                <th class="text-left">Lv. 50</th>
                <th class="text-left">Weakest</th>
                <th class="text-left">Class</th>
                <th class="text-left">Lv. 50</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stat in stats" :key="stat">
                <td>{{ stat }}</td>
                <td>
                  {{ getHighest(stat, 50)[0].name }}
                  ({{ getHighest(stat, 50)[0].monsterId }})
                </td>
                <td>
                  {{
                    findMonster(
                      getHighest(stat, 50)[0].monsterId
                    ).baseStats.totalPoints()
                  }}
                </td>
                <td>{{ getHighest(stat, 50)[0].value }}</td>
                <td>
                  {{ getHighest(stat, 50)[1].name }}
                  ({{ getHighest(stat, 50)[1].monsterId }})
                </td>
                <td>
                  {{
                    findMonster(
                      getHighest(stat, 50)[1].monsterId
                    ).baseStats.totalPoints()
                  }}
                </td>
                <td>{{ getHighest(stat, 50)[1].value }}</td>
                <td>
                  {{ getLowest(stat, 50)[1].name }}
                  ({{ getLowest(stat, 50)[1].monsterId }})
                </td>
                <td>
                  {{
                    findMonster(
                      getLowest(stat, 50)[1].monsterId
                    ).baseStats.totalPoints()
                  }}
                </td>
                <td>{{ getLowest(stat, 50)[1].value }}</td>
                <td>
                  {{ getLowest(stat, 50)[0].name }}
                  ({{ getLowest(stat, 50)[0].monsterId }})
                </td>
                <td>
                  {{
                    findMonster(
                      getLowest(stat, 50)[0].monsterId
                    ).baseStats.totalPoints()
                  }}
                </td>
                <td>{{ getLowest(stat, 50)[0].value }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="3">
        <v-text-field
          v-model="source"
          label="Source"
          :hint="getMonsterName(source)"
          persistent-hint
        />
      </v-col>
      <v-col cols="3">
        <v-text-field
          v-model="target1"
          label="Target 1"
          :hint="getMonsterName(target1)"
          persistent-hint
        />
      </v-col>
      <v-col cols="3">
        <v-text-field
          v-model="target2"
          label="Target 2"
          :hint="getMonsterName(target2)"
          persistent-hint
        />
      </v-col>
      <v-col cols="3">
        <v-text-field
          v-model="target3"
          label="Target 3"
          :hint="getMonsterName(target3)"
          persistent-hint
        />
      </v-col>
      <v-col cols="3">
        <v-text-field v-model="levelsModel" label="Levels" />
      </v-col>
      <v-col cols="9"></v-col>
      <v-col cols="3">
        <v-text-field v-model="power" label="Power" />
      </v-col>
      <v-col cols="3">
        <v-text-field v-model="accuracy" label="Accuracy" />
      </v-col>
      <v-col cols="3">
        <v-select
          :items="['ATK', 'INT']"
          label="Attack Stat"
          v-model="atkStat"
        ></v-select>
      </v-col>
      <v-col cols="3">
        <v-select
          :items="['DEF', 'RES']"
          label="Defense Stat"
          v-model="defStat"
        ></v-select>
      </v-col>
    </v-row>
    <v-row v-if="sourceMonster && targetMonsters.length > 0">
      <v-col cols="12">
        <v-data-table
          :headers="analysisHeaders"
          :items="analysisValues"
          :items-per-page="15"
          class="elevation-1"
          :must-sort="true"
          :footer-props="{
            showFirstLastPage: true,
            itemsPerPageOptions: [15, 30, 50, 100, -1],
          }"
        >
          <template v-slot:item.hitRate="{ item }">
            <v-chip :color="getHitRateColor(item.hitRate)" dark>
              {{ item.hitRate }}%
            </v-chip>
          </template>
          <template v-slot:item.damageRatio="{ item }">
            <v-chip :color="getDamageRateColor(item.damageRatio)" dark>
              {{ item.damageRatio }}%
            </v-chip>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Container from "typedi";
import StatsService from "@/game-engine/monster/stats/StatsService";
import MonsterIndexEditorRepository from "./MonsterIndexEditorRepository";
import MonsterIndex from "@/game-engine/monster/MonsterIndex";
import Stats from "@/game-engine/monster/stats/Stats";
import FormulaService from "@/game-engine/monster-action/FormulaService";
import NumberUtil from "@/utils/NumberUtil";
import StatsConstants from "@/game-engine/monster/stats/StatsContants";

export default Vue.extend({
  name: "MonsterIndexStatComparator",
  components: {},
  props: {},
  data: () => ({
    statsService: Container.get<StatsService>(StatsService),
    monsters: Container.get<MonsterIndexEditorRepository>(
      MonsterIndexEditorRepository
    ).load(),
    formulaService: Container.get<FormulaService>(FormulaService),
    source: "001",
    target1: "004",
    target2: "007",
    target3: "010",
    levelsModel: "45,50,55",
    power: 100,
    accuracy: 100,
    atkStat: StatsConstants.ATK,
    defStat: StatsConstants.DEF,
  }),
  computed: {
    stats(): string[] {
      return StatsConstants.COLLECTION.filter((s) => s !== StatsConstants.HP);
    },
    sourceMonster(): MonsterIndex | null {
      return this.findMonster(this.source);
    },
    targetMonsters(): MonsterIndex[] {
      return [this.target1, this.target2, this.target3]
        .map((i) => this.findMonster(i))
        .filter((m) => m)
        .map((m) => m as MonsterIndex);
    },
    levels(): number[] {
      return this.levelsModel
        .split(",")
        .map((s) => s.trim())
        .filter(NumberUtil.isNumber)
        .map(NumberUtil.parse);
    },
    monstersWithLevels(): { monster: MonsterIndex; level: number }[] {
      const monsters = [this.sourceMonster, ...this.targetMonsters]
        .filter((m) => m)
        .map((m) => m as MonsterIndex);

      return monsters.flatMap((m) =>
        this.levels.map((level) => {
          return {
            monster: m,
            level: level,
          };
        })
      );
    },
    analysisValues(): {
      source: MonsterIndex;
      sourceLevel: number;
      hit: number;
      target: MonsterIndex;
      targetLevel: number;
      dex: number;
      hitRate: number;
      damageAvg: number;
      maxHP: number;
      damageRatio: number;
      atkStat: number;
      defStat: number;
    }[] {
      const source = this.sourceMonster;
      if (!source) {
        return [];
      }
      return this.levels.flatMap((sourceLevel) =>
        this.levels.flatMap((targetLevel) =>
          this.targetMonsters.flatMap((target) => {
            const attempts = 60;
            const hits = this.estimateHits(
              source,
              sourceLevel,
              target,
              targetLevel,
              attempts
            );
            const hitRate = Math.round((100 * hits) / attempts);

            const damageAvg = this.estimateDamage(
              source,
              sourceLevel,
              target,
              targetLevel,
              attempts
            );
            const maxHP = this.getStats(targetLevel, target).maxHP;
            const damageRatio = Math.round((100 * damageAvg) / maxHP);

            const sourceStats = this.getStats(sourceLevel, source);
            const atkStat = this.formulaService.getAtk(
              sourceStats,
              this.atkStat
            );
            const targetStats = this.getStats(targetLevel, target);
            const defStat = this.formulaService.getDef(
              targetStats,
              this.defStat
            );

            return {
              source: source,
              sourceLevel: sourceLevel,
              hit: sourceStats.hit,
              target: target,
              targetLevel: targetLevel,
              dex: targetStats.dex,
              hitRate: hitRate,
              damageAvg: damageAvg,
              maxHP: maxHP,
              damageRatio: damageRatio,
              atkStat: atkStat,
              defStat: defStat,
            };
          })
        )
      );
    },
    analysisHeaders(): { text: string; value: string; sortable?: boolean }[] {
      return [
        {
          text: "Source",
          sortable: false,
          value: "source.name",
        },
        { text: "Source Level", value: "sourceLevel", sortable: false },
        { text: "Target", value: "target.name" },
        { text: "Target Level", value: "targetLevel" },
        { text: "Hit", value: "hit", sortable: false },
        { text: "Dex", value: "dex" },
        { text: "Hit Rate", value: "hitRate" },
        { text: "Attacker Stat", value: "atkStat", sortable: false },
        { text: "Defender Stat", value: "defStat" },
        { text: "Damage Avg", value: "damageAvg" },
        { text: "Max HP", value: "maxHP" },
        { text: "Damage %", value: "damageRatio" },
      ];
    },
  },
  methods: {
    getMonsterName(id: string): string {
      const monster = this.findMonster(id);
      if (monster) {
        return monster.name;
      }
      return "";
    },
    findMonster(id: string): MonsterIndex | null {
      const monster = this.monsters.find((m) => m.monsterId === id);
      if (monster) {
        return monster;
      }
      return null;
    },
    getStats(level: number, monster: MonsterIndex): Stats {
      return this.statsService.getAttributesByLevel(
        level,
        monster.baseStats,
        monster.growthRates
      );
    },
    estimateHits(
      source: MonsterIndex,
      sourceLevel: number,
      target: MonsterIndex,
      targetLevel: number,
      attempts: number
    ): number {
      const sourceStats = this.getStats(sourceLevel, source);
      const targetStats = this.getStats(targetLevel, target);
      let hits = 0;
      for (let i = 0; i < attempts; i++) {
        const hit = this.formulaService.doHit(
          sourceStats,
          targetStats,
          this.accuracy
        );
        if (hit) {
          hits++;
        }
      }
      return hits;
    },
    estimateDamage(
      source: MonsterIndex,
      sourceLevel: number,
      target: MonsterIndex,
      targetLevel: number,
      attempts: number
    ): number {
      const sourceStats = this.getStats(sourceLevel, source);
      const targetStats = this.getStats(targetLevel, target);
      let totalDamage = 0;
      for (let i = 0; i < attempts; i++) {
        const damage = this.formulaService.doDamage(
          source,
          target,
          this.formulaService.getAtk(sourceStats, this.atkStat),
          this.formulaService.getDef(targetStats, this.defStat),
          this.power,
          []
        );
        totalDamage += damage;
      }
      return Math.round(totalDamage / attempts);
    },
    getHitRateColor(hitRate: number): string {
      if (hitRate < 30) {
        return "red";
      }
      if (hitRate < 60) {
        return "orange";
      }
      if (hitRate < 90) {
        return "yellow";
      }
      return "green";
    },
    getDamageRateColor(damageRate: number): string {
      if (damageRate === 0) {
        return "red";
      }
      if (damageRate < 40) {
        return "orange";
      }
      if (damageRate < 80) {
        return "yellow";
      }
      return "green";
    },
    getHighest(
      stat: string,
      level: number
    ): { monsterId: string; name: string; value: number }[] {
      return this.sortByStat(stat, level).reverse();
    },
    getLowest(
      stat: string,
      level: number
    ): { monsterId: string; name: string; value: number }[] {
      return this.sortByStat(stat, level);
    },
    sortByStat(
      stat: string,
      level: number
    ): { monsterId: string; name: string; value: number }[] {
      return this.monsters
        .map((m) => m)
        .map((m) => {
          return {
            monsterId: m.monsterId,
            name: m.name,
            value: this.statsService.getStat(this.getStats(level, m), stat),
          };
        })
        .sort((a, b) => {
          return a.value - b.value;
        });
    },
  },
});
</script>
