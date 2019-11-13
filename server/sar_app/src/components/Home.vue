<template>
  <div>
    <v-app-bar
      fixed
      dark
      darken-2
    >
      <v-toolbar-title>
        <v-icon>
          mdi-chart-areaspline
        </v-icon>
        {{ title }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-bottom-sheet v-model="sheet">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon>
            <v-icon>mdi-settings</v-icon>
          </v-btn>
        </template>

        <v-sheet class="text-center" height="600px">
          <v-btn
            class="mt-6"
            @click="sheet = !sheet"
          >close
          </v-btn>

          <v-container fluid>
            <v-layout row wrap pa-3>
              <v-flex xs2 pa-2>
                <p>リソースデータ選択</p>
              </v-flex>
              <v-flex xs3 pa-2>
                <v-btn
                  color="primary"
                  @click="open"
                  large
                >
                  <v-icon dark class="mr-1">
                    mdi-file-upload
                  </v-icon>
                  選択
                  <v-progress-circular slot="loading" indeterminate color="primary" dark></v-progress-circular>
                </v-btn>
              </v-flex>
            </v-layout>

            <v-layout row wrap pa-3>
              <v-flex xs2 pa-2>
                <p>描画領域サイズ</p>
              </v-flex>
              <v-flex xs5 pa-2>
                <v-slider v-model="width" min="0" max="1500" label="Width" thumb-label v-on:change="initialize"/>
                {{ width }}px
              </v-flex>
              <v-flex xs5 pa-2>
                <v-slider v-model="height" min="0" max="1600" label="Height" thumb-label v-on:change="initialize"/>
                {{ height }}px
              </v-flex>
            </v-layout>

            <v-layout row wrap pa-3>
              <v-flex xs2 pa-2>
                <p>サンプル解像度</p>
              </v-flex>
              <v-flex xs5 pa-2>
                <v-slider v-model="thinning" min="0" max="99" label="Thinning" thumb-label v-on:change="initialize"/>
                {{ thinning }}%
              </v-flex>
            </v-layout>

            <v-layout row wrap pa-3>
              <v-flex xs2 pa-2>
                <p>時間帯</p>
              </v-flex>
              <v-flex xs5 pa-2>
                <v-range-slider
                  v-model="time_range"
                  :value="time_range"
                  min="0"
                  max="24"
                  label="Time Range"
                  tick-size="5"
                  v-on:change="initialize"
                >
                  <template v-slot:thumb-label="props">
                    {{ times[props.value] }}
                  </template>
                </v-range-slider>
                {{ times[time_range[0]]}} - {{times[time_range[1]]}}
              </v-flex>
            </v-layout>
          </v-container>

        </v-sheet>
      </v-bottom-sheet>

    </v-app-bar>

    <v-container fluid mt-12>
      <v-layout row wrap>
        <v-flex>
          <draggable :options="options">
            <cpu-chart
              :key=1
              class="item"
              :options="config"
              :stats="stats"
              :width="width"
              :height="height"
              :thinning="thinning"
              :start="times[time_range[0]]"
              :end="times[time_range[1]]"
              ref="cpu"
            />
            <mem-chart
              :key=2
              class="item"
              :options="config"
              :stats="stats"
              :width="width"
              :height="height"
              :thinning="thinning"
              :start="times[time_range[0]]"
              :end="times[time_range[1]]"
              ref="mem"
            />
            <queue-chart
              :key=3
              class="item"
              :options="config"
              :stats="stats"
              :width="width"
              :height="height"
              :thinning="thinning"
              :start="times[time_range[0]]"
              :end="times[time_range[1]]"
              ref="queue"
            />
          </draggable>
        </v-flex>
      </v-layout>

    </v-container>
  </div>
</template>

<script>
  import draggable from 'vuedraggable'
  import CpuChart from "./Metrics/CpuChart"
  import MemChart from "./Metrics/MemChart"
  import QueueChart from "./Metrics/QueueChart"

  const FONT_COLOR = "rgba(244, 244, 244, 1)"
  const FONT_SIZE = 10

  const {dialog, BrowserWindow} = require('electron').remote
  const fs = require('fs')

  export default {
    data: () => ({
      options: {
        animation: 200
      },
      json: null,
      index: 0,
      sheet: false,
      width: 200,
      height: 60,
      thinning: 50,
      time_range: [0, 24],
      title: "Sar - Analyze Activity Information.",
      stats: null,
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
      times: [
        '00:00',
        '01:00',
        '02:00',
        '03:00',
        '04:00',
        '05:00',
        '06:00',
        '07:00',
        '08:00',
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
        '18:00',
        '19:00',
        '20:00',
        '21:00',
        '22:00',
        '23:00',
        '24:00',
      ],
    }),
    components: {
      'cpu-chart': CpuChart,
      'mem-chart': MemChart,
      'queue-chart': QueueChart,
      'draggable': draggable,
    },
    props: {},

    created() {
      this.debug('Home Component created.')
    },

    mounted() {
      this.debug('Home Component mounted.')
    },

    methods: {
      initialize: function () {
        if (this.json !== null) {
          this.stats = this.json.sysstat.hosts[0].statistics
          this.$refs.cpu.initialize()
          this.$refs.mem.initialize()
          this.$refs.queue.initialize()
        }
      },
      open() {
        const win = BrowserWindow.getFocusedWindow()
        dialog.showOpenDialog(
            win,
            {
              properties: ['openFile'],
              filters: [
                {
                  name: 'Document',
                  extensions: ['json']
                }
              ]
            },
            (fileNames) => {
              if (fileNames) {
                this.read(fileNames[0])
              }
            }
        )
      },
      read(path) {
        fs.readFile(path, (error, data) => {
          if (error != null) {
            alert("file open error.");
            return;
          }
          this.json = JSON.parse(data.toString());
          this.height = 540
          this.width = 500
          this.initialize()
        })
      }
    },

  }
</script>

<style scoped>
  .item {
    display: inline-block;
    border: 3px solid #404040;
    border-radius: 10px;
    background-color: #333333;
  }

  .item:hover {
    cursor: grab;
  }

  .item:active {
    cursor: grabbing;
  }
</style>
