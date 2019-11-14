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
      <v-bottom-sheet v-model="sheet" persistent>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon>
            <v-icon>mdi-settings</v-icon>
          </v-btn>
        </template>

        <v-sheet
          class="text-center"
          height="600px">
          <v-btn class="mt-6" @click="close">
            close
          </v-btn>

          <v-container fluid>
            <v-layout row wrap pa-3>
              <v-flex xs2 pa-2>
                <p>テーマ選択</p>
              </v-flex>
              <v-flex xs3 pa-2>
                <v-switch v-model="isDark" class="ma-2" label="Dark"></v-switch>
              </v-flex>
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
                <v-slider v-model="thinning" min="1" max="100" label="Thinning" thumb-label v-on:change="initialize"/>
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
            <io-chart
              :key=4
              class="item"
              :options="config"
              :stats="stats"
              :width="width"
              :height="height"
              :thinning="thinning"
              :start="times[time_range[0]]"
              :end="times[time_range[1]]"
              ref="io"
            />
            <disk-chart
              :key=5
              class="item"
              :options="config"
              :stats="stats"
              :width="width"
              :height="height"
              :thinning="thinning"
              :start="times[time_range[0]]"
              :end="times[time_range[1]]"
              ref="disk"
            />

            <network-chart
              :key=6
              class="item"
              :options="config"
              :stats="stats"
              :width="width"
              :height="height"
              :thinning="thinning"
              :start="times[time_range[0]]"
              :end="times[time_range[1]]"
              ref="network_0"
              :iface_no=0
            />
            <network-chart
              :key=7
              class="item"
              :options="config"
              :stats="stats"
              :width="width"
              :height="height"
              :thinning="thinning"
              :start="times[time_range[0]]"
              :end="times[time_range[1]]"
              ref="network_1"
              :iface_no=1
            />
            <network-chart
              :key=8
              class="item"
              :options="config"
              :stats="stats"
              :width="width"
              :height="height"
              :thinning="thinning"
              :start="times[time_range[0]]"
              :end="times[time_range[1]]"
              ref="network_2"
              :iface_no=2
            />
            <network-chart
              :key=9
              class="item"
              :options="config"
              :stats="stats"
              :width="width"
              :height="height"
              :thinning="thinning"
              :start="times[time_range[0]]"
              :end="times[time_range[1]]"
              ref="network_3"
              :iface_no=3
            />
            <network-chart
              :key=10
              class="item"
              :options="config"
              :stats="stats"
              :width="width"
              :height="height"
              :thinning="thinning"
              :start="times[time_range[0]]"
              :end="times[time_range[1]]"
              ref="network_4"
              :iface_no=4
            />
            <network-chart
              :key=11
              class="item"
              :options="config"
              :stats="stats"
              :width="width"
              :height="height"
              :thinning="thinning"
              :start="times[time_range[0]]"
              :end="times[time_range[1]]"
              ref="network_5"
              :iface_no=5
            />

            <network-error-chart
              :key=12
              class="item"
              :options="config"
              :stats="stats"
              :width="width"
              :height="height"
              :thinning="thinning"
              :start="times[time_range[0]]"
              :end="times[time_range[1]]"
              ref="network_error_0"
              :iface_no=0
            />
            <network-error-chart
              :key=13
              class="item"
              :options="config"
              :stats="stats"
              :width="width"
              :height="height"
              :thinning="thinning"
              :start="times[time_range[0]]"
              :end="times[time_range[1]]"
              ref="network_error_1"
              :iface_no=1
            />
            <network-error-chart
              :key=14
              class="item"
              :options="config"
              :stats="stats"
              :width="width"
              :height="height"
              :thinning="thinning"
              :start="times[time_range[0]]"
              :end="times[time_range[1]]"
              ref="network_error_2"
              :iface_no=2
            />
            <network-error-chart
              :key=15
              class="item"
              :options="config"
              :stats="stats"
              :width="width"
              :height="height"
              :thinning="thinning"
              :start="times[time_range[0]]"
              :end="times[time_range[1]]"
              ref="network_error_3"
              :iface_no=3
            />
            <network-error-chart
              :key=16
              class="item"
              :options="config"
              :stats="stats"
              :width="width"
              :height="height"
              :thinning="thinning"
              :start="times[time_range[0]]"
              :end="times[time_range[1]]"
              ref="network_error_4"
              :iface_no=4
            />
            <network-error-chart
              :key=17
              class="item"
              :options="config"
              :stats="stats"
              :width="width"
              :height="height"
              :thinning="thinning"
              :start="times[time_range[0]]"
              :end="times[time_range[1]]"
              ref="network_error_5"
              :iface_no=5
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
  import IoChart from "./Metrics/IoChart"
  import DiskChart from "./Metrics/DiskChart"
  import NetworkChart from "./Metrics/NetworkChart"
  import NetworkErrorChart from "./Metrics/NetworkErrorChart"

  const FONT_SIZE = 10
  let FONT_COLOR = "white"
  const {dialog, BrowserWindow} = require('electron').remote
  const fs = require('fs')

  export default {
    data: () => ({
      isDark: true,
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
      'io-chart': IoChart,
      'disk-chart': DiskChart,
      'network-chart': NetworkChart,
      'network-error-chart': NetworkErrorChart,
      'draggable': draggable,
    },
    props: {},

    created() {
      this.debug('Home Component created.')
    },

    mounted() {
      this.debug('Home Component mounted.')
    },
    watch: {
      isDark(newValue) {
        this.debug("watch isDark:" + newValue)
        this.$vuetify.theme.dark = !this.$vuetify.theme.dark
        this.debug("watch theme.dark:" + this.$vuetify.theme.dark)
        this.config = {
          font_color: this.$vuetify.theme.dark ? "white" : "black",
          font_size: FONT_SIZE,
          grid_line_setting: {
            display: true,
            drawOnChartArea: true,
            color: "rgba(128, 128, 128, .5)",
            zeroLineColor: "rgba(64, 64, 64, 1)"
          }
        }

        this.initialize()
      }
    },


    methods: {
      initialize: function () {
        if (this.json !== null) {
          this.stats = this.json.sysstat.hosts[0].statistics
          this.$refs.cpu.initialize()
          this.$refs.mem.initialize()
          this.$refs.queue.initialize()
          this.$refs.io.initialize()
          this.$refs.disk.initialize()
          this.$refs.network_0.initialize()
          this.$refs.network_1.initialize()
          this.$refs.network_2.initialize()
          this.$refs.network_3.initialize()
          this.$refs.network_4.initialize()
          this.$refs.network_5.initialize()
          this.$refs.network_error_0.initialize()
          this.$refs.network_error_1.initialize()
          this.$refs.network_error_2.initialize()
          this.$refs.network_error_3.initialize()
          this.$refs.network_error_4.initialize()
          this.$refs.network_error_5.initialize()
        }
      },
      close() {
        this.sheet = !this.sheet
        this.initialize()
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
            alert("file open error.")
            return
          }
          this.json = JSON.parse(data.toString())
          // eslint-disable-next-line no-console
          console.log('json')

          // eslint-disable-next-line no-console
          console.log(this.json)
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
    border-radius: 10px;
  }

  .item:hover {
    cursor: grab;
  }

  .item:active {
    cursor: grabbing;
  }
</style>
