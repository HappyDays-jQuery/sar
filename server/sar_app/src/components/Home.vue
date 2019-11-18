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
          height="100%">
          <v-btn class="mt-6" @click="close">
            close
          </v-btn>

          <v-container fluid>
            <v-layout row wrap pa-3>
              <v-row align="center" justify="start">
                <p class="text-md-left ma-3 pa-6">リソースデータ選択</p>
                <v-btn color="primary" @click="open" large>
                  <v-icon dark class="mr-1">
                    mdi-file-upload
                  </v-icon>
                  選択
                  <v-progress-circular slot="loading" indeterminate color="primary" dark></v-progress-circular>
                </v-btn>
                <p class="ml-10 my-3 mr-3 pa-6">テーマ選択</p>
                <v-switch v-model="isDark" label="Dark"></v-switch>

              </v-row>
            </v-layout>

            <v-layout row wrap pa-3>
              <v-flex xs2 pa-2>
                <p class="text-md-left">グラフ表示</p>
              </v-flex>
              <v-flex xs10 pa-2>
                <v-row>
                  <v-switch v-model="all" label="ALL"></v-switch>
                </v-row>
                <v-row>
                  <v-checkbox class="mr-4" v-model="cpu" label="CPU"></v-checkbox>
                  <v-checkbox class="mr-4" v-model="mem" label="Memory"></v-checkbox>
                  <v-checkbox class="mr-4" v-model="queue" label="Queue"></v-checkbox>
                  <v-checkbox class="mr-4" v-model="io" label="I/O"></v-checkbox>
                  <v-checkbox class="mr-4" v-model="disk" label="Disk"></v-checkbox>
                </v-row>
                <v-row>
                  <v-checkbox class="mr-4" v-model="nw_0" label="Network 1"></v-checkbox>
                  <v-checkbox class="mr-4" v-model="nw_1" label="Network 2"></v-checkbox>
                  <v-checkbox class="mr-4" v-model="nw_2" label="Network 3"></v-checkbox>
                  <v-checkbox class="mr-4" v-model="nw_3" label="Network 4"></v-checkbox>
                  <v-checkbox class="mr-4" v-model="nw_4" label="Network 5"></v-checkbox>
                  <v-checkbox class="mr-4" v-model="nw_5" label="Network 6"></v-checkbox>
                </v-row>
                <v-row>
                  <v-checkbox class="mr-4" v-model="nw_err_0" label="Network Error 1"></v-checkbox>
                  <v-checkbox class="mr-4" v-model="nw_err_1" label="Network Error 2"></v-checkbox>
                  <v-checkbox class="mr-4" v-model="nw_err_2" label="Network Error 3"></v-checkbox>
                  <v-checkbox class="mr-4" v-model="nw_err_3" label="Network Error 4"></v-checkbox>
                  <v-checkbox class="mr-4" v-model="nw_err_4" label="Network Error 5"></v-checkbox>
                  <v-checkbox class="mr-4" v-model="nw_err_5" label="Network Error 6"></v-checkbox>
                </v-row>
                <v-row>
                  <v-checkbox class="mr-4" v-model="paging" label="Paging"></v-checkbox>
                  <v-checkbox class="mr-4" v-model="swap" label="swap"></v-checkbox>
                </v-row>
              </v-flex>
            </v-layout>

            <v-layout row wrap pa-3>
              <v-flex xs2 pa-2>
                <p class="text-md-left">描画領域サイズ</p>
              </v-flex>
              <v-flex xs3 pa-2>
                <v-slider v-model="width" min="0" max="1500" label="Width" thumb-label v-on:change="initialize"/>
                {{ width }}px
              </v-flex>
              <v-flex xs3 pa-2>
                <v-slider v-model="height" min="0" max="1600" label="Height" thumb-label v-on:change="initialize"/>
                {{ height }}px
              </v-flex>
            </v-layout>

            <v-layout row wrap pa-3>
              <v-flex xs2 pa-2>
                <p class="text-md-left">サンプル解像度</p>
              </v-flex>
              <v-flex xs5 pa-2>
                <v-slider v-model="thinning" min="1" max="100" label="Thinning" thumb-label v-on:change="initialize"/>
                {{ thinning }}%
              </v-flex>
            </v-layout>

            <v-layout row wrap pa-3>
              <v-flex xs2 pa-2>
                <p class="text-md-left">時間帯</p>
              </v-flex>
              <v-flex xs5 pa-2>
                <v-range-slider
                  v-model="time_range"
                  :value="time_range"
                  min="0"
                  max="48"
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
              :show="cpu"
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
              :show="mem"
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
              :show="queue"
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
              :show="io"
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
              :show="disk"
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
              :show="nw_0"
              @toggle="toggleKey"
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
              :show="nw_1"
              @toggle="toggleKey"
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
              :show="nw_2"
              @toggle="toggleKey"
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
              :show="nw_3"
              @toggle="toggleKey"
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
              :show="nw_4"
              @toggle="toggleKey"
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
              :show="nw_5"
              @toggle="toggleKey"
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
              :show="nw_err_0"
              @toggle="toggleKey"
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
              :show="nw_err_1"
              @toggle="toggleKey"
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
              :show="nw_err_2"
              @toggle="toggleKey"
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
              :show="nw_err_3"
              @toggle="toggleKey"
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
              :show="nw_err_4"
              @toggle="toggleKey"
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
              :show="nw_err_5"
              @toggle="toggleKey"
            />
            <paging-chart
              :key=18
              class="item"
              :options="config"
              :stats="stats"
              :width="width"
              :height="height"
              :thinning="thinning"
              :start="times[time_range[0]]"
              :end="times[time_range[1]]"
              ref="paging"
              :show="paging"
            />
            <swap-chart
              :key=19
              class="item"
              :options="config"
              :stats="stats"
              :width="width"
              :height="height"
              :thinning="thinning"
              :start="times[time_range[0]]"
              :end="times[time_range[1]]"
              ref="swap"
              :show="swap"
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
  import PagingChart from "./Metrics/PagingChart"
  import SwapChart from "./Metrics/SwapChart"

  const FONT_SIZE = 10
  let FONT_COLOR = "white"
  const {dialog, BrowserWindow} = require('electron').remote
  const fs = require('fs')

  export default {
    data: () => ({
      isDark: true,
      all: false,
      cpu: true,
      mem: true,
      queue: true,
      io: true,
      disk: true,
      nw_0: false,
      nw_1: false,
      nw_2: false,
      nw_3: false,
      nw_4: false,
      nw_5: false,
      nw_err_0: false,
      nw_err_1: false,
      nw_err_2: false,
      nw_err_3: false,
      nw_err_4: false,
      nw_err_5: false,
      paging: true,
      swap: true,
      options: {
        animation: 200
      },
      json: null,
      index: 0,
      sheet: false,
      width: 200,
      height: 60,
      thinning: 50,
      time_range: [0, 48],
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
        '00:30',
        '01:00',
        '01:30',
        '02:00',
        '02:30',
        '03:00',
        '03:30',
        '04:00',
        '04:30',
        '05:00',
        '05:30',
        '06:00',
        '06:30',
        '07:00',
        '07:30',
        '08:00',
        '08:30',
        '09:00',
        '09:30',
        '10:00',
        '10:30',
        '11:00',
        '11:30',
        '12:00',
        '12:30',
        '13:00',
        '13:30',
        '14:00',
        '14:30',
        '15:00',
        '15:30',
        '16:00',
        '16:30',
        '17:00',
        '17:30',
        '18:00',
        '18:30',
        '19:00',
        '19:30',
        '20:00',
        '20:30',
        '21:00',
        '21:30',
        '22:00',
        '22:30',
        '23:00',
        '23:30',
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
      'paging-chart': PagingChart,
      'swap-chart': SwapChart,
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
      },
      all() {
        this.cpu = this.all
        this.mem = this.all
        this.queue = this.all
        this.io = this.all
        this.disk = this.all
        this.nw_0 = this.all
        this.nw_1 = this.all
        this.nw_2 = this.all
        this.nw_3 = this.all
        this.nw_4 = this.all
        this.nw_5 = this.all
        this.nw_err_0 = this.all
        this.nw_err_1 = this.all
        this.nw_err_2 = this.all
        this.nw_err_3 = this.all
        this.nw_err_4 = this.all
        this.nw_err_5 = this.all
        this.paging = this.all
        this.swap = this.all
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
          this.$refs.paging.initialize()
          this.$refs.swap.initialize()
        }
      }
      ,
      close() {
        this.sheet = !this.sheet
        this.initialize()
      }
      ,
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
      }
      ,
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
      ,
      toggleKey(key) {
        this.debug(key + ":" + this[key])
        this[key] = !this[key]
        this.debug(this[key])
      }
    }
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
