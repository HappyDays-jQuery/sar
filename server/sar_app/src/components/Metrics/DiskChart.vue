<template>
  <v-sheet
    :width="width"
    :height="height"
    class="graph"
    v-show="show"
  >
    <h3 class="px-4 mb-4 font-weight-black">Disk</h3>

    <line-chart :chart-data="dataContents" :options="chartOptions"></line-chart>

    <v-btn grey class="ml-4 mb-4" @click="showLegend = !showLegend">Legend</v-btn>
    <v-btn grey class="ml-4 mb-4" @click="showExplain = !showExplain">Explain</v-btn>

    <ul class="px-10 py-3" v-show="showLegend">
      <li>tps：１秒間あたりのI/O転送回数</li>
      <li>rd_sec/s：１秒間あたりに読み込みを行ったセクター数</li>
      <li>wr_sec/s：１秒間あたりに書き込みを行ったセクター数</li>
      <li>avgrq-sz：</li>
      <li>avgqu-sz：</li>
      <li>await：I/O応答時間の平均</li>
      <li>svctm：</li>
      <li>%util：ディスクの使用率（I/O処理をしていてビジーだった時間の割合）</li>
    </ul>
    <p class="pa-3" v-show="showExplain">
      <code>%util</code>の値が大きい場合はIOがボトルネックになっている可能性があります。また、<code>await</code>はアプリケーションのパフォーマンスに直接的に影響する値なので重要です。
    </p>

  </v-sheet>
</template>

<script>
  import LineChart from './LineChart'
  import 'chartjs-plugin-colorschemes'

  export default {
    name: 'DiskChart',
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
      this.debug('Disk Chart created.')
    },
    mounted() {
      this.debug('Disk Chart mounted.')
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
                  labelString: "Size / Count"
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
                  labelString: "%"
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
      fillData(label, tps, rd_sec, wr_sec, avgrq_sz, avgqu_sz, _await, svctm, util_precent) {
        this.dataContents = {
          labels: label,
          datasets: [
            {label: 'tps', data: tps, yAxisID: "y-axis-1"},
            {label: 'rd_sec/s', data: rd_sec, yAxisID: "y-axis-1"},
            {label: 'wr_sec/s', data: wr_sec, yAxisID: "y-axis-1"},
            {label: 'avgrq-sz', data: avgrq_sz, yAxisID: "y-axis-1"},
            {label: 'avgqu-sz', data: avgqu_sz , yAxisID: "y-axis-1"},
            {label: 'await', data: _await , yAxisID: "y-axis-1"},
            {label: 'svctm', data: svctm , yAxisID: "y-axis-1"},
            {label: '%util', data: util_precent , yAxisID: "y-axis-2"},
          ]
        }
      },
      setStats() {
        this.debug("stats func getStats")
        this.assignStats(this.stats)
      },
      assignStats(stats) {
        let label = [], tps = [], rd_sec = [], wr_sec = [], avgrq_sz = [], avgqu_sz  = [], _await  = [], svctm  = [], util_precent  = []
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
          tps.push(stats[i].disk[0].tps)
          rd_sec.push(stats[i].disk[0].rd_sec)
          wr_sec.push(stats[i].disk[0].wr_sec)
          avgrq_sz.push(stats[i].disk[0]['avgrq-sz'])
          avgqu_sz.push(stats[i].disk[0]['avgqu-sz'])
          _await.push(stats[i].disk[0]['await'])
          svctm.push(stats[i].disk[0].svctm)
          util_precent.push(stats[i].disk[0]['util-precent'])
        }
        this.fillData(label, tps, rd_sec, wr_sec, avgrq_sz, avgqu_sz, _await, svctm, util_precent)
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
