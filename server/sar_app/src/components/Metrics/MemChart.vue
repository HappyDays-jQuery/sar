<template>
  <v-sheet
    :width="width"
    :height="height"
    class="graph"
    v-show="show"
  >
    <h3 class="px-4 mb-4 font-weight-black">Memory</h3>
    <line-chart :chart-data="dataContents" :options="chartOptions"></line-chart>

    <v-btn grey class="ml-4 mb-4" @click="showLegend = !showLegend">Legend</v-btn>
    <v-btn grey class="ml-4 mb-4" @click="showExplain = !showExplain">Explain</v-btn>

    <ul class="px-10 py-3" v-show="showLegend">
      <li>memfree：空きメモリのMB数</li>
      <li>memused：使用中メモリのMB数</li>
      <li>%memused：メモリ使用率</li>
      <li>buffers：バッファとして使われているメモリのMB数</li>
      <li>cached：ページキャッシュとして使われているメモリのMB数</li>
      <li>commit：現在必要とされているメモリのMB数</li>
      <li>active：利用頻度の高いメモリのMB数</li>
      <li>inactive：利用頻度の低い、解放されやすいメモリのMB数</li>
      <li>dirty：ディスクに同期されていないメモリのMB数</li>

    </ul>
    <p class="pa-3" v-show="showExplain">
      メモリが足りなくなると、メモリの一部をストレージに退避させるスワッピングが発生し
      パフォーマンスが大きく劣化することがあるので注意。
      ただし、buffersとcachedはカーネルがいつでも開放することができるキャッシュなので、
      たとえメモリ使用率が高かったとしても、この２つの値が大きい場合には問題にはなりません。
    </p>
  </v-sheet>
</template>

<script>
  import LineChart from './LineChart'
  import 'chartjs-plugin-colorschemes'

  export default {
    name: 'MemChart',
    components: {
      "line-chart": LineChart,
    },
    data: () => ({
      dataContents: null,
      chartOptions: null,
      showLegend: false,
      showExplain: false,
    }),
    props: ['options', 'stats', 'width', 'height', 'thinning', 'start', 'end', 'show'],
    created() {
      this.debug('Mem Chart created.')
    },
    mounted() {
      this.debug('Mem Chart mounted.')
    },
    methods: {
      initialize: function () {
        this.setStats()
        this.setOption()
      },
      setOption() {
        this.chartOptions = {
          elements: {
            line: {
              tension: 0,
            }
          },
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            fullWidth: false,
            labels: {
              boxWidth: 20,
              fontColor: this.options.font_color
            },
          },
          layout: {
            padding: {
              top: 10,
              left: 10,
              bottom: 10,
              right: 10
            }
          },
          scales: {
            yAxes: [
              {
                id: "y-axis-1",
                position: "left",
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 5,
                  min: 0,
                  fontColor: this.options.font_color
                },
                gridLines: this.options.grid_line_setting,
                scaleLabel: {
                  display: true,
                  fontSize: this.options.font_size,
                  fontColor: this.options.font_color,
                  labelString: "MB"
                }
              },
              {
                id: "y-axis-2",
                position: "right",
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 5,
                  max: 100,
                  min: 0,
                  fontColor: this.options.font_color
                },
                gridLines: this.options.grid_line_setting,
                scaleLabel: {
                  display: true,
                  fontSize: this.options.font_size,
                  fontColor: this.options.font_color,
                  labelString: "％"
                }
              }
            ],
            xAxes: [
              {
                gridLines: this.options.grid_line_setting,
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 10,
                  fontColor: this.options.font_color,
                  fontSize: this.options.font_size
                },
                scaleLabel: {
                  display: true,
                  fontSize: this.options.font_size,
                  fontColor: this.options.font_color,
                  labelString: "Time"
                }
              }
            ],
          },
          plugins: {
            colorschemes: {
              scheme: 'tableau.Tableau20',
            },
          },
        }
      },
      fillData(label, memfree, memused, memused_percent, buffers, cached, commit, commit_percent, active, inactive, dirty) {
        this.dataContents = {
          labels: label,
          datasets: [
            {label: 'memfree', data: memfree, yAxisID: "y-axis-1"},
            {label: 'memused', data: memused, yAxisID: "y-axis-1"},
            {label: '%memused', data: memused_percent, yAxisID: "y-axis-2"},
            {label: 'buffers', data: buffers, yAxisID: "y-axis-1"},
            {label: 'cached', data: cached, yAxisID: "y-axis-1"},
            {label: 'commit', data: commit, yAxisID: "y-axis-1"},
            /*            {label: 'commit_percent', data: commit_percent, yAxisID: "y-axis-2"},*/
            {label: 'active', data: active, yAxisID: "y-axis-1"},
            {label: 'inactive', data: inactive, yAxisID: "y-axis-1"},
            {label: 'dirty', data: dirty, yAxisID: "y-axis-1"},
          ]
        }
      },
      setStats() {
        this.debug("stats func getStats")
        this.assignStats(this.stats)
      },
      assignStats(stats) {
        this.loading = false
        let label = [], memfree = [], memused = [], memused_percent = [], buffers = [], cached = [], commit = [],
            commit_percent = [], active = [], inactive = [], dirty = []
        let sample_count = stats.length
        let thinning_val = Math.floor(sample_count / this.thinning)
        for (let i = 0; i < stats.length; i++) {
          let time_str = stats[i].timestamp.time.substr(0, 5)
          if (i % thinning_val !== 0 && sample_count > this.thinning) {
            continue
          }
          if (!(this.start < time_str && this.end > time_str)) {
            continue
          }
          label.push(time_str)
          memfree.push(Math.ceil(stats[i].memory.memfree / 1024))
          memused.push(Math.ceil(stats[i].memory.memused / 1024))
          memused_percent.push(stats[i].memory[']memused-percent'])
          buffers.push(Math.ceil(stats[i].memory.buffers / 1024))
          cached.push(Math.ceil(stats[i].memory.cached / 1024))
          commit.push(Math.ceil(stats[i].memory.commit / 1024))
          commit_percent.push(stats[i].memory['commit-percent'])
          active.push(Math.ceil(stats[i].memory.active / 1024))
          inactive.push(Math.ceil(stats[i].memory.inactive / 1024))
          dirty.push(Math.ceil(stats[i].memory.dirty / 1024))
        }
        this.fillData(label, memfree, memused, memused_percent, buffers, cached, commit, commit_percent, active, inactive, dirty)

      },
      errorStats(data) {
        this.loading = false
        this.disabled = false
        this.debug(data)
      }
    }
  }
</script>

<style scoped lang="scss">
  .graph {
    overflow: scroll;
    display: inline-block;
    box-sizing: border-box;
    margin: 15px;
    padding: 15px;
  }
  .graph::-webkit-scrollbar{
    display: none;
  }
</style>
