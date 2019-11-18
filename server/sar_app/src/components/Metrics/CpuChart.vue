<template>
  <v-sheet
    :width="width"
    :height="height"
    class="graph"
    v-show="show"
  >
    <h3 class="px-4 mb-4 font-weight-black">CPU</h3>

    <line-chart :chart-data="dataContents" :options="chartOptions"></line-chart>

    <v-btn class="ml-4 mb-4" @click="showLegend = !showLegend">Legend</v-btn>
    <v-btn class="ml-4 mb-4" @click="showExplain = !showExplain">Explain</v-btn>

    <ul class="px-10 py-3" v-show="showLegend">
      <li>%user：CPUがユーザモードにあった時間の割合</li>
      <li>%nice：優先度（nice値）設定されたユーザプロセス実行によるCPU時間の割合</li>
      <li>%system：CPUがカーネルモードにあった時間の割合</li>
      <li>%iowait：CPUがIO待ちをしていた時間の割合</li>
      <li>%steal：ゲストOSがCPU割り当て待ちとなった時間の割合</li>
      <li>%idle：CPUがアイドル状態にあった時間の割合</li>
    </ul>

    <p class="pa-3" v-show="showExplain">
      マルチコアの場合、上記の結果ようにCPUごとの使用率が見られます。
      当然ですが、全てのカラムの値を足すと100%になります。
      %idleの値が小さいとCPUの使用率が高いということになので、CPUがパフォーマンスのボトルネックになっている可能性があります。
    </p>

  </v-sheet>
</template>

<script>
  import LineChart from './LineChart'
  import 'chartjs-plugin-colorschemes'

  export default {
    name: 'CpuChart',
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
      this.debug('Cpu Chart created.')
    },
    mounted() {
      this.debug('Cpu Chart mounted.')
    },
    watch:{
      chartOptions(){
        this.debug('Cpu Chart Options changed.')
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
      fillData(label, user, nice, system, iowait, steal, idle) {
        this.dataContents = {
          labels: label,
          datasets: [
            {label: '%user', data: user},
            {label: '%nice', data: nice},
            {label: '%system', data: system},
            {label: '%iowait', data: iowait},
            {label: '%steal', data: steal},
            {label: '%idle', data: idle},
          ]
        }
      },
      setStats() {
        this.debug("stats func getStats")
        this.debug(this.stats)
        this.assignStats(this.stats)
      },
      assignStats(stats) {
        let label = [], user = [], nice = [], system = [], iowait = [], steal = [], idle = []
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
          user.push(stats[i]['cpu-load-all'][0].user)
          nice.push(stats[i]['cpu-load-all'][0].nice)
          system.push(stats[i]['cpu-load-all'][0].system)
          iowait.push(stats[i]['cpu-load-all'][0].iowait)
          steal.push(stats[i]['cpu-load-all'][0].steal)
          idle.push(stats[i]['cpu-load-all'][0].idle)
        }
        this.fillData(label, user, nice, system, iowait, steal, idle)
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
