<template>
  <v-sheet
    :width="width"
    :height="height"
    class="graph"
    v-show="show"
  >
    <h3 class="px-4 mb-4 font-weight-black">Network Error - {{ iface }}</h3>
    <line-chart :chart-data="dataContents" :options="chartOptions"></line-chart>

    <v-btn grey class="ml-4 mb-4" @click="showLegend = !showLegend">Legend</v-btn>
    <v-btn grey class="ml-4 mb-4" @click="showExplain = !showExplain">Explain</v-btn>

    <ul class="px-10 py-3" v-show="showLegend">
      <li>rxerr/s：1秒あたり総受信不良パケット数</li>
      <li>txerr/s：パケット送信時に発生した1秒あたりエラー発生数</li>
      <li>coll/s：パケット送信時に発生した1秒あたりパケット衝突数</li>
      <li>rxdrop/s：Linuxバッファ上の領域不足によって発生した、1秒あたりの受信パケットのドロップ数</li>
      <li>txdrop/s：Linuxバッファ上の領域不足によって発生した、1秒あたりの送信パケットのドロップ数</li>
      <li>txcarr/s：パケット送信時に発生した1秒あたりのキャリアエラー数</li>
      <li>rxfram/s：パケット受信時に発生した、1秒あたりフレーム・アラインメント・エラー数</li>
      <li>rxfifo/s：秒あたりの受信パケットのFIFOオーバーラン・エラー数</li>
      <li>txfifo/s：1秒あたりの送信パケットのFIFOオーバーラン・エラー数</li>
    </ul>
    <p class="pa-3" v-show="showExplain">

    </p>
  </v-sheet>
</template>

<script>
  import LineChart from './LineChart'
  import 'chartjs-plugin-colorschemes'

  export default {
    name: 'NetworkErrorChart',
    components: {
      "line-chart": LineChart,
    },
    data: () => ({
      dataContents: null,
      chartOptions: null,
      showLegend: false,
      showExplain: false,
      iface: '-',
      visible: true
    }),
    props: ['options', 'stats', 'width', 'height', 'thinning', 'start', 'end', 'iface_no', 'show'],
    created() {
      this.debug('Network Error Chart created.')
    },
    mounted() {
      this.debug('Network Error Chart mounted.')
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
            {label: 'rxcmp/s', data: rxcmp},
            {label: 'rxkB/s', data: rxkB},
            {label: 'rxmcst/s', data: rxmcst},
            {label: 'rxpck/s', data: rxpck},
            {label: 'txcmp/s', data: txcmp},
            {label: 'txkB/s', data: txkB},
            {label: 'txpck/s', data: txpck},
          ]
        }
      },
      setStats() {
        this.debug("stats func getStats")
        this.assignStats(this.stats)
      },
      assignStats(stats) {
        this.loading = false
        let label = [], coll = [], rxdrop = [], rxerr = [], rxfifo = [], rxfram = [], txcarr = [], txdrop = [], txerr = [], txfifo = []
        let sample_count = stats.length
        let thinning_val = Math.floor(sample_count / this.thinning)
        let key = "nw_err_" + this.iface_no
        if (!this.stats[0].network['net-edev'][this.iface_no]) {
          if (this.show) {
            this.$emit('toggle', key)
          }
          this.iface = "No Data."
          this.fillData(label, coll, rxdrop, rxerr, rxfifo, rxfram, txcarr, txdrop, txerr, txfifo)
          return
        }

        this.iface = this.stats[0].network['net-edev'][this.iface_no].iface
        for (let i = 0; i < stats.length; i++) {
          let time_str = stats[i].timestamp.time.substr(0, 5)
          if (i % thinning_val !== 0 && sample_count > this.thinning) {
            continue
          }
          if (!(this.start < time_str && this.end > time_str)) {
            continue
          }
          label.push(time_str)
          coll.push(stats[i].network['net-edev'][this.iface_no].coll)
          rxdrop.push(stats[i].network['net-edev'][this.iface_no].rxdrop)
          rxerr.push(stats[i].network['net-edev'][this.iface_no].rxerr)
          rxfifo.push(stats[i].network['net-edev'][this.iface_no].rxfifo)
          rxfram.push(stats[i].network['net-edev'][this.iface_no].rxfram)
          txcarr.push(stats[i].network['net-edev'][this.iface_no].txcarr)
          txdrop.push(stats[i].network['net-edev'][this.iface_no].txdrop)
          txerr.push(stats[i].network['net-edev'][this.iface_no].txerr)
          txfifo.push(stats[i].network['net-edev'][this.iface_no].txfifo)
        }
        this.fillData(label, coll, rxdrop, rxerr, rxfifo, rxfram, txcarr, txdrop, txerr, txfifo)

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
