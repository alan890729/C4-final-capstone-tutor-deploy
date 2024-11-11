module.exports = {
  bottomThresholdPageNum: 5, // a property for changing page button display, implicitly used

  // limit will be set to 10 if not mentioned, meaning 10 records per page.
  getTotalPage (amountOfRecords, limit = 10) {
    return Math.ceil(amountOfRecords / limit)
  },

  getPreviousPage (currentPage, totalPage) {
    if (totalPage === 0) return 1
    if (currentPage < 1) currentPage = 1
    if (currentPage > totalPage) currentPage = totalPage

    return currentPage - 1 || currentPage
  },

  getNextPage (currentPage, totalPage) {
    if (totalPage === 0) return 1
    if (currentPage < 1) currentPage = 1
    if (currentPage > totalPage) currentPage = totalPage

    return currentPage + 1 > totalPage ? totalPage : currentPage + 1
  },

  getPageBtnArr (currentPage, totalPage) {
    if (currentPage < 1) currentPage = 1
    if (currentPage > totalPage) currentPage = totalPage

    let pageBtnArr = []
    if (totalPage < 10) {
      pageBtnArr = Array.from({ length: totalPage }).map((_, i) => ({
        pageNum: i + 1
      }))

      return pageBtnArr
    }

    const upperThresholdPageNum = totalPage - 3

    switch (true) {
      case currentPage < this.bottomThresholdPageNum:
        console.log('currentPage:', currentPage)
        console.log(`1 2 3 4 5 ... ${totalPage}`)
        pageBtnArr = Array.from({ length: 5 }).map((_, i) => {
          return {
            pageNum: i + 1
          }
        })
        pageBtnArr.push(
          {
            pageNum: '...',
            isDisabled: true
          },
          {
            pageNum: totalPage
          }
        )
        break
      case currentPage >= this.bottomThresholdPageNum && currentPage < upperThresholdPageNum:
        console.log('currentPage:', currentPage)
        console.log(`1 ... ${currentPage - 1} ${currentPage} ${currentPage + 1} ... ${totalPage}`)
        pageBtnArr.push(
          {
            pageNum: 1
          },
          {
            pageNum: '...',
            isDisabled: true
          },
          {
            pageNum: currentPage - 1
          },
          {
            pageNum: currentPage
          },
          {
            pageNum: currentPage + 1
          },
          {
            pageNum: '...',
            isDisabled: true
          },
          {
            pageNum: totalPage
          }
        )
        break
      case currentPage >= upperThresholdPageNum:
        console.log('currentPage:', currentPage)
        console.log(`1 ... ${totalPage - 4} ${totalPage - 3} ${totalPage - 2} ${totalPage - 1} ${totalPage}`)
        pageBtnArr = Array.from({ length: 5 }).map((_, i) => {
          return {
            pageNum: totalPage - (4 - i)
          }
        })
        pageBtnArr.unshift(
          {
            pageNum: 1
          },
          {
            pageNum: '...',
            isDisabled: true
          }
        )
        break
    }

    return pageBtnArr
  },

  generatePaginatorForRender (amountOfRecords, currentPage, limit = 10) {
    const totalPage = this.getTotalPage(amountOfRecords, limit)

    if (currentPage < 1) currentPage = 1
    if (currentPage > totalPage) currentPage = totalPage

    const prevPage = this.getPreviousPage(currentPage, totalPage)
    const nextPage = this.getNextPage(currentPage, totalPage)
    const pageBtnArr = this.getPageBtnArr(currentPage, totalPage)
    pageBtnArr.forEach(pageBtn => {
      if (pageBtn.pageNum === currentPage) {
        pageBtn.isActive = true
      }
    })

    return {
      prevPage,
      nextPage,
      pageBtnArr,
      currentPage,
      totalPage
    }
  }
}
