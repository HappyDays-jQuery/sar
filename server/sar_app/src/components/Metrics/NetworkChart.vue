<template>
  <v-sheet
    :width="width"
    :height="height"
    class="graph"
    v-show="show"
  >
    <h3 class="px-4 mb-4 font-weight-black">Network - {{ iface }}</h3>
    <line-chart :chart-data="dataContents" :options="chartOptions"></line-chart>

    <v-btn grey class="ml-4 mb-4" @click="showLegend = !showLegend">Legend</v-btn>
    <v-btn grey class="ml-4 mb-4" @click="showExplain = !showExplain">Explain</v-btn>

    <ul class="px-10 py-3" v-show="showLegend">
      <li>rxpck/s：1秒間あたりの送信パケット数</li>
      <li>rxkB/s：1秒間あたりの受信バイト数</li>
      <li>txkB/s：1秒間あたりの送信バイト数</li>
      <li>rxcmp/s：1秒間あたりの圧縮受信パケット数</li>
      <li>txcmp/s：1秒間あたりの圧縮送信パケット数</li>
      <li>rxmcst/s：1秒間あたりのマルチキャスト受信パケット数</li>
    </ul>
    <p class="pa-3" v-show="showExplain">

    </p>
  </v-sheet>
</template>

<script>
  import LineChart from './LineChart'
  import 'chartjs-plugin-colorschemes'

  export default {
    name: 'NetworkChart',
    components: {
      "line-chart": LineChart,
    },
    data: () => ({
      dataContents: null,
      chartOptions: null,
      showLegend: false,
      showExplain: false,
      iface:'-',
    }),
    props: ['options', 'stats', 'width', 'height', 'thinning', 'start', 'end', 'iface_no', 'show'],
    created() {
      this.debug('Network Chart created.')
    },
    mounted() {
      this.debug('Network Chart mounted.')
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
                  labelString: "Packet Count"
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
                  labelString: "Byte"
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
      fillData(label, rxcmp, rxkB, rxmcst, rxpck, txcmp, txkB, txpck) {
        this.dataContents = {
          labels: label,
          datasets: [
            {label: 'rxcmp/s', data: rxcmp, yAxisID: "y-axis-1"},
            {label: 'rxkB/s', data: rxkB, yAxisID: "y-axis-2"},
            {label: 'rxmcst/s', data: rxmcst, yAxisID: "y-axis-1"},
            {label: 'rxpck/s', data: rxpck, yAxisID: "y-axis-1"},
            {label: 'txcmp/s', data: txcmp, yAxisID: "y-axis-1"},
            {label: 'txkB/s', data: txkB, yAxisID: "y-axis-2"},
            {label: 'txpck/s', data: txpck, yAxisID: "y-axis-1"},
          ]
        }
      },
      setStats() {
        this.debug("stats func getStats")
        this.assignStats(this.stats)
      },
      assignStats(stats) {
        this.loading = false
        let label = [], rxcmp = [], rxkB = [], rxmcst = [], rxpck = [], txcmp = [], txkB = [], txpck = []
        let sample_count = stats.length
        let thinning_val = Math.floor(sample_count / this.thinning)
        if(!this.stats[0].network['net-dev'][this.iface_no]){
          this.iface = "No Data."
          this.fillData(label, rxcmp, rxkB, rxmcst, rxpck, txcmp, txkB, txpck)
          return
        }

        this.iface = this.stats[0].network['net-dev'][this.iface_no].iface
        for (let i = 0; i < stats.length; i++) {
          let time_str = stats[i].timestamp.time.substr(0, 5)
          if (i % thinning_val !== 0 && sample_count > this.thinning) {
            continue
          }
          if (!(this.start < time_str && this.end > time_str)) {
            continue
          }
          label.push(time_str)
          rxcmp.push(stats[i].network['net-dev'][this.iface_no].rxcmp)
          rxkB.push(stats[i].network['net-dev'][this.iface_no].rxkB)
          rxmcst.push(stats[i].network['net-dev'][this.iface_no].rxmcst)
          rxpck.push(stats[i].network['net-dev'][this.iface_no].rxpck)
          txcmp.push(stats[i].network['net-dev'][this.iface_no].txcmp)
          txkB.push(stats[i].network['net-dev'][this.iface_no].txkB)
          txpck.push(stats[i].network['net-dev'][this.iface_no].txpck)
        }
        this.fillData(label, rxcmp, rxkB, rxmcst, rxpck, txcmp, txkB, txpck)

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
