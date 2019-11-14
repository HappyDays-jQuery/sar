<template>
  <v-sheet
    :width="width"
    :height="height"
    class="graph"
  >
    <h3 class="px-4 mb-4 font-weight-black">Swap Page</h3>

    <line-chart :chart-data="dataContents" :options="chartOptions"></line-chart>

    <v-btn class="ml-4 mb-4" @click="showLegend = !showLegend">Legend</v-btn>
    <v-btn class="ml-4 mb-4" @click="showExplain = !showExplain">Explain</v-btn>

    <ul class="px-10 py-3" v-show="showLegend">
      <li>pswpin/s：1秒間に取り込んだスワップページの総数</li>
      <li>pswpout/s：1秒間に取り出したスワップページの総数</li>

    </ul>

    <p class="pa-3" v-show="showExplain">
    </p>

  </v-sheet>
</template>

<script>
  import LineChart from './LineChart'
  import 'chartjs-plugin-colorschemes'

  export default {
    name: 'SwapPageChart',
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
      this.debug('Swap Chart created.')
    },
    mounted() {
      this.debug('Swap Chart mounted.')
    },
    watch:{
      chartOptions(){
        this.debug('Swap Chart Options changed.')
      }
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
                  labelString: "Page"
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
      fillData(label, pswpin, pswpout) {
        this.dataContents = {
          labels: label,
          datasets: [
            {label: 'pswpin/s', data: pswpin},
            {label: 'pswpout/s', data: pswpout},
          ]
        }
      },
      setStats() {
        this.debug("stats func getStats")
        this.debug(this.stats)
        this.assignStats(this.stats)
      },
      assignStats(stats) {
        let label = [], pswpin = [], pswpout = []
        let sample_count = stats.length
        let thinning_val = Math.floor(sample_count / this.thinning)

        for (let i = 0; i < stats.length; i++) {
          let time_str = stats[i].timestamp.time.substr(0, 5)

          if (i % thinning_val !== 0
              && sample_count > this.thinning) {
            continue
          }

          if (!(this.start < time_str && this.end > time_str)) {
            continue
          }
          label.push(time_str)
          pswpin.push(stats[i]['swap-pages'].pswpin)
          pswpout.push(stats[i]['swap-pages'].pswpout)
        }
        this.fillData(label, pswpin, pswpout)
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
