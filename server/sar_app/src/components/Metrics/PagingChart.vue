<template>
  <v-sheet
    :width="width"
    :height="height"
    class="graph"
    v-show="show"
  >
    <h3 class="px-4 mb-4 font-weight-black">Paging</h3>

    <line-chart :chart-data="dataContents" :options="chartOptions"></line-chart>

    <v-btn grey class="ml-4 mb-4" @click="showLegend = !showLegend">Legend</v-btn>
    <v-btn grey class="ml-4 mb-4" @click="showExplain = !showExplain">Explain</v-btn>

    <ul class="px-10 py-3" v-show="showLegend">
      <li>pgpgin/s：1秒間にディスクからページインしたKBの合計数</li>
      <li>pgpgout/s：1秒間にディスクからページアウトしたKBの合計数</li>
      <li>fault/s：1秒間に行なわれたページフォールトの数</li>
      <li>majflt/s：1秒間に行なわれたメジャーフォールトの数</li>
      <li>pgfree/s：1秒間に空きメモリへ登録されたページ数</li>
      <li>pgscank/s：1秒間に<code>kswapd</code>デーモンによって回収されたページ数</li>
      <li>pgscand/s：1秒間にプロセスから直接回収されたページ数</li>
      <li>pgsteal/s：1秒間にキャッシュから回収したページ数</li>
      <li>%vmeff：<code>pgsteal/pgscand</code>の値。ページ再利用の効率性を示す。</li>
    </ul>
    <p class="pa-3" v-show="showExplain">
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
                  labelString: "kB / Count"
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
      fillData(label, majflt, pgfree, pgpgin, pgpgout, pgscand, pgscank, pgsteal, uvmeff_percent) {
        this.dataContents = {
          labels: label,
          datasets: [
            {label: 'majflt/s', data: majflt, yAxisID: "y-axis-1"},
            {label: 'pgfree/s', data: pgfree, yAxisID: "y-axis-1"},
            {label: 'pgpgin/s', data: pgpgin, yAxisID: "y-axis-1"},
            {label: 'pgpgout/s', data: pgpgout, yAxisID: "y-axis-1"},
            {label: 'pgscand/s', data: pgscand , yAxisID: "y-axis-1"},
            {label: 'pgscank/s', data: pgscank , yAxisID: "y-axis-1"},
            {label: 'pgsteasl/s', data: pgsteal , yAxisID: "y-axis-1"},
            {label: '%uvmeff', data: uvmeff_percent , yAxisID: "y-axis-2"},
          ]
        }
      },
      setStats() {
        this.debug("stats func getStats")
        this.assignStats(this.stats)
      },
      assignStats(stats) {
        let label = [], majflt = [], pgfree = [], pgpgin = [], pgpgout = [], pgscand  = [], pgscank  = [], pgsteal  = [], uvmeff_percent  = []
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
          majflt.push(stats[i].paging.majflt)
          pgfree.push(stats[i].paging.pgfree)
          pgpgin.push(stats[i].paging.pgpgin)
          pgpgout.push(stats[i].paging.pgpgout)
          pgscand.push(stats[i].paging.pgscand)
          pgscank.push(stats[i].paging.pgscank)
          pgsteal.push(stats[i].paging.pgsteal)
          uvmeff_percent.push(stats[i].paging['uvmeff-precent'])
        }
        this.fillData(label, majflt, pgfree, pgpgin, pgpgout, pgscand, pgscank, pgsteal, uvmeff_percent)
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
  .graph::-webkit-scrollbar{
    display: none;
  }
</style>
