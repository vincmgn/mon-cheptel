export default defineEventHandler(async (event) => {
  return await prisma.bull.findMany({
    include: {
      comments: true,
    },
    orderBy: {
      name: "asc",
    },
  });
});
