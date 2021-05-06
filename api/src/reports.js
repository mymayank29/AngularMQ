const {
  comparisonHelpers,
  anchorHelpers,
  cvssComparisonHelpers,
  cvssHelpers
} = require('./database/helpers');
const { findAllComparisonEntries } = comparisonHelpers;
const { findAnchorByID } = anchorHelpers;
const { findCVSSByID } = cvssHelpers;
const { findAllCVSSComparisonsByCompId } = cvssComparisonHelpers;

const generateReport = async tags => {
  if (!tags) {
    try {
      const allComparisons = await findAllComparisonEntries();
      const allComparisonData = await Promise.all(
        allComparisons.map(async comparison => {
          const anchorData = await findAnchorByID(comparison.anchorid);
          const cvssComparisonRefs = await findAllCVSSComparisonsByCompId(
            comparison.id
          );
          const cvssData = await Promise.all(
            cvssComparisonRefs.map(async comparisonRef =>
              findCVSSByID(comparisonRef.cvssId)
            )
          );
          comparison.comparisonData = JSON.parse(comparison.comparisonDataJSON);
          comparison.anchorData = anchorData;
          comparison.cvssData = cvssData;
          return comparison;
        })
      );
      const reportData = allComparisonData.map(comparisonData => {
        return {
          comparison: comparisonData.comparisonData,
          itemtag: comparisonData.itemtag,
          anchorData: JSON.parse(comparisonData.anchorData.dataJSON),
          cvssData: comparisonData.cvssData.map(cvssDataEntry => ({
            cvssId: cvssDataEntry.id,
            cvssData: JSON.parse(cvssDataEntry.dataJSON)
          }))
        };
      });

      const keysArr = Object.keys(reportData[0].comparison[0]);

      const columnDefs = [{ headerName: 'Tag', field: 'tag' }].concat(
        reportData.reduce((output, data) => {
          output = output.concat([
            { headerName: `(A)${data.itemtag}`, field: `(A)${data.itemtag}` }
          ]);
          output = output.concat(
            data.cvssData.map((cvssData, i) => ({
              headerName: `(C)${data.itemtag}`,
              field: `(C${cvssData.cvssId})${data.itemtag}`
            }))
          );
          return output;
        }, [])
      );

      const rowData = keysArr.map(key => {
        const sheetDataObj = { tag: key };
        reportData.forEach(data => {
          sheetDataObj[`(A)${data.itemtag}`] = data.anchorData[key]
            ? `${data.anchorData[key]}`
            : null;
          data.cvssData.forEach(cvssDataEntry => {
            sheetDataObj[
              `(C${cvssDataEntry.cvssId})${data.itemtag}`
            ] = cvssDataEntry.cvssData[key]
              ? `${cvssDataEntry.cvssData[key]}`
              : null;
          });
        });
        return sheetDataObj;
      });

      const gridOptions = {
        columnDefs,
        rowData,
        context: reportData.reduce(
          (output, data) => {
            data.cvssData.forEach((cvssEntry, i) => {
              output[`(C${cvssEntry.cvssId})${data.itemtag}`] =
                data.comparison[i];
              output[`(C${cvssEntry.cvssId})${data.itemtag}`].cvssId =
                cvssEntry.cvssId;
            });
            return output;
          },
          { rowDefs: rowData.map(data => data.tag) }
        ),
        defaultColDef: {
          sortable: true,
          filter: true,
          resizable: true,
          minWidth: 100
        },
        excelStyles: [
          {
            id: 'redBackground',
            // alignment: {
            //   horizontal: 'Right',
            //   vertical: 'Bottom'
            // },
            borders: {
              borderBottom: {
                color: '#000000',
                lineStyle: 'Continuous',
                weight: 1
              },
              borderLeft: {
                color: '#000000',
                lineStyle: 'Continuous',
                weight: 1
              },
              borderRight: {
                color: '#000000',
                lineStyle: 'Continuous',
                weight: 1
              },
              borderTop: {
                color: '#000000',
                lineStyle: 'Continuous',
                weight: 1
              }
            },
            font: { color: 'white' },
            interior: {
              color: 'red',
              pattern: 'Solid'
            }
          }
        ]
      };
      return gridOptions;
    } catch (err) {
      console.log(err);
    }
  }
};

module.exports = { generateReport };
