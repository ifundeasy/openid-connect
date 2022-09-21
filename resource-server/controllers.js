module.exports = {
  pi: async (ctx) => {
    ctx.status = 200
    ctx.message = Math.PI.toString()
  },
}
