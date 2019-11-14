<template>
  <v-sheet
    :width="width"
    :height="height"
    class="graph"
  >
    <h3 class="px-4 mb-4 font-weight-black">I/O</h3>

    <line-chart :chart-data="dataContents" :options="chartOptions"></line-chart>

    <v-btn grey class="ml-4 mb-4" @click="showLegend = !showLegend">Legend</v-btn>
    <v-btn grey class="ml-4 mb-4" @click="showExplain = !showExplain">Explain</v-btn>

    <ul class="px-10 py-3" v-show="showLegend">
      <li>tps：秒間I/Oリクエスト 数の合計</li>
      <li>rtps：秒間読み込みIOリクエスト数の合計</li>
      <li>wtps：秒間書き込みIOリクエスト数の合計</li>
      <li>bread/s：秒間読み込み（ブロック単位）IOリクエストのデータ量の合計</li>
      <li>bwrtn/s：秒間書き込み（ブロック単位）IOリクエストのデータ量の合計</li>
    </ul>

    <p class="pa-3" v-show="showExplain">
    </p>

  </v-sheet>
</template>

<script>
  import LineChart from './LineChart'
  import 'chartjs-plugin-colorschemes'

  export default {
    name: 'IoChart',
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
      this.debug('I/O Chart created.')
    },
    mounted() {
      this.debug('I/O Chart mounted.')
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
                  labelString: "Count"
                }
              },
              {
                id: "y-axis-2",
                position: "right",
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
                  labelString: "Data"
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
      fillData(label, tps, rtps, wtps, breadps, bwrtnps) {
        this.dataContents = {
          labels: label,
          datasets: [
            {label: 'tps', data: tps, yAxisID: "y-axis-1"},
            {label: 'rtps', data: rtps, yAxisID: "y-axis-1"},
            {label: 'wtps', data: wtps, yAxisID: "y-axis-1"},
            {label: 'bread/s', data: breadps, yAxisID: "y-axis-2"},
            {label: 'bwrtn/s', data: bwrtnps , yAxisID: "y-axis-2"},
          ]
        }
      },
      setStats() {
        this.debug("stats func getStats")
        this.assignStats(this.stats)
      },
      assignStats(stats) {
        let label = [], tps = [], rtps = [], wtps = [], breadps = [], bwrtnps = []
        let sample_count = stats.length
        let thinning_val = Math.floor(sample_count / this.thinning)

        for (let i = 0; i < stats.length; i++) {
          let time_str = stats[i].timestamp.time.substr(0, 5)

          if (i % thinning_val !== 0
              && sample_count > this.thinning) {
            continue
          }

          if(!(this.start < time_str && this.end > time_str)){
            continue
          }
          label.push(time_str)
          tps.push(stats[i].io.tps)
          rtps.push(stats[i].io['io-reads'].rtps)
          wtps.push(stats[i].io['io-writes'].wtps)
          breadps.push(stats[i].io['io-reads']['bread'])
          bwrtnps.push(stats[i].io['io-writes']['bwrtn'])
        }
        this.fillData(label, tps, rtps, wtps, breadps, bwrtnps)
      },
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
