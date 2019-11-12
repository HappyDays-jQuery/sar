<template>
  <div>
    <v-app-bar
      fixed
      dark
      darken-2
    >
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-bottom-sheet v-model="sheet">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon>
            <v-icon>mdi-settings</v-icon>
          </v-btn>
        </template>

        <v-sheet class="text-center" height="500px">
          <v-btn
            class="mt-6"
            @click="sheet = !sheet"
          >close
          </v-btn>

          <v-container fluid mt-12>

            <v-layout row wrap pa-3>
              <v-flex xs2 pa-2>
                <p>リソースデータ選択</p>
              </v-flex>
              <v-flex xs5 pa-2>

              </v-flex>
            </v-layout>

            <v-layout row wrap pa-3>
              <v-flex xs2 pa-2>
                <p>描画領域サイズ</p>
              </v-flex>
              <v-flex xs5 pa-2>
                <v-slider v-model="width" min="0" max="1500" label="Width"></v-slider>
              </v-flex>
              <v-flex xs5 pa-2>
                <v-slider v-model="height" min="0" max="1600" label="Height"></v-slider>
              </v-flex>
            </v-layout>
          </v-container>

        </v-sheet>
      </v-bottom-sheet>

    </v-app-bar>

    <v-container fluid mt-12>
      <v-layout row wrap>
        <v-flex>
          <cpu-chart :options="config" :stats="stats" :width="width" :height="height" ref="cpu"/>
          <mem-chart :options="config" :stats="stats" :width="width" :height="height" ref="mem"/>
          <queue-chart :options="config" :stats="stats" :width="width" :height="height" ref="load"/>
        </v-flex>
      </v-layout>

    </v-container>


    <v-footer dark app fixed>
      <span class="white--text ml-3" v-html="footer"></span>
    </v-footer>
  </div>
</template>

<script>
  import CpuChart from "./Metrics/CpuChart"
  import MemChart from "./Metrics/MemChart"
  import QueueChart from "./Metrics/QueueChart"
  import json from '../resorces/sa06'

  const FONT_COLOR = "rgba(244, 244, 244, 1)"
  const FONT_SIZE = 10

  export default {
    data: () => ({
      resources: [
        "sa06.json",
        "sa07.json",
        "sa08.json"
      ],
      sheet: false,
      width: 1600,
      height: 500,
      title: "Sar Information Visualization.",
      footer: "&copy; sar.",
      stats: json.sysstat.hosts[0].statistics,
      config: {
        font_color: FONT_COLOR,
        font_size: FONT_SIZE,
        grid_line_setting: {
          display: true,
          drawOnChartArea: true,
          color: "rgba(128, 128, 128, .5)",
          zeroLineColor: "rgba(64, 64, 64, 1)"
        }
      },
    }),
    components: {
      'cpu-chart': CpuChart,
      'mem-chart': MemChart,
      'queue-chart': QueueChart,
    },
    props: {},

    created() {
      this.debug('Home Component created.')
      this.initialize()
    },

    mounted() {
      this.debug('Home Component mounted.')
    },

    methods: {
      initialize: function () {
      },
    },

  }
</script>
