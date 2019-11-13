<template>
  <v-sheet
    :width="width"
    :height="height"
    class="graph"
  >
    <h3 class="px-4 mb-4 font-weight-black">Queue</h3>
    <line-chart :chart-data="dataContents" :options="chartOptions"></line-chart>

    <v-btn grey class="ml-4 mb-4" @click="showLegend = !showLegend">Legend</v-btn>
    <v-btn grey class="ml-4 mb-4" @click="showExplain = !showExplain">Explain</v-btn>

    <ul class="px-10 py-3 grey darken-2" v-show="showLegend">
      <li>runq-sz：ランキューにあるタスク数</li>
      <li>plist-sz：プロセスリスト中のプロセス数とスレッド数</li>
      <li>ldavg-&LT;n&GT;：最近n分間のロードアベレージ</li>
      <li>blocked;：入出力が完了するのを待っている、現在ブロックされているタスクの数</li>
    </ul>

    <p class="pa-3 grey darken-2" v-show="showExplain">
      ランキューにあるタスク数は、「CPUが現在同時に実行しているタスク数」を表しています。
      一般に、ランキューにあるタスク数がCPUの数を超えると、CPUの数が足りておらずパフォーマンスが落ちている可能性があると言われています。
      ランキューのタスク数は計算機のパフォーマンスがおかしい時に必ず見るべき重要な指標です。
      ロードアベレージはランキューのタスク数の時間平均で、こちらも同様に重要です。
      過去１分間、５分間、１５分間の値が表示されているので、大まかに、負荷が上がってきているのか落ち着いてきているのか把握することができます。
    </p>
  </v-sheet>
</template>

<script>
  import LineChart from './LineChart'
  import 'chartjs-plugin-colorschemes'

  export default {
    name: 'LoadChart',
    components: {
      "line-chart": LineChart,
    },
    data: () => ({
      dataContents: null,
      chartOptions: null,
      showLegend: false,
      showExplain: false,
    }),
    props: ['options', 'stats', 'width', 'height', 'thinning', 'start', 'end'],
    created() {
      this.debug('Load Chart created.')
    },
    mounted() {
      this.debug('Load Chart mounted.')
    },
    methods: {
      initialize: function () {
        this.setOption()
        this.setStats()
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
                  labelString: "Load Average"
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
                  labelString: "Size"
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
      fillData(label, runq_sz, plist_sz, ldavg_1, ldavg_5, ldavg_15, blocked) {
        this.dataContents = {
          labels: label,
          datasets: [
            {label: 'runq-sz', data: runq_sz, yAxisID: "y-axis-2"},
            {label: 'plist-sz', data: plist_sz, yAxisID: "y-axis-2"},
            {label: 'ldavg-1', data: ldavg_1, yAxisID: "y-axis-1"},
            {label: 'ldavg-5', data: ldavg_5, yAxisID: "y-axis-1"},
            {label: 'ldavg-15', data: ldavg_15, yAxisID: "y-axis-1"},
            {label: 'blocked', data: blocked, yAxisID: "y-axis-1"},
          ]
        }
      },
      setStats() {
        this.debug("stats func getStats")
        this.assignStats(this.stats)
      },
      assignStats(stats) {
        this.loading = false
        let label = [], runq_sz = [], plist_sz = [], ldavg_1 = [], ldavg_5 = [], ldavg_15 = [], blocked = []
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
          runq_sz.push(stats[i].queue['runq-sz'])
          plist_sz.push(stats[i].queue['plist-sz'])
          ldavg_1.push(stats[i].queue['ldavg-1'])
          ldavg_5.push(stats[i].queue['ldavg-5'])
          ldavg_15.push(stats[i].queue['ldavg-15'])
          blocked.push(stats[i].queue['blocked'])
        }
        this.fillData(label, runq_sz, plist_sz, ldavg_1, ldavg_5, ldavg_15, blocked)

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
</style>
