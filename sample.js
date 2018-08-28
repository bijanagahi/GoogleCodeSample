function totalSums(override) { //#Updated on 4/17/2018 by Bijan A.
          $('.accession').css( "background-color", "white" );
          $('.accessionIncluded').val('');
          var sum = 0;
          var minReactions = parseInt($('#minReactions').val());
          var maxReactions = parseInt($('#maxReactions').val());
          //#Batch Selection is done using a Dynamic Algorithm based on 
          //#  the '0-1 knapsack problem', with the totals being the weights,
          //#  and the value for each accession is exponentially higher based on it's priority.
          //#  rows are selected based on back-propigation after building the 
          //#  dynamic table (T), which is a 2D array of dimentions [rows_in_table x maxReactions]
          var T = new Array(); //#initialize main Array
          T.push(new Array()); //#Create 2D Array
          var i=0; //#for row number
          var batchPooled = null; 
          var weights = []//#to keep track of row totals
          weights[0] = 0;
           for(var x=0;x<maxReactions+1;x++){
             T[0][x] = 0; //#Fill first rows with 0's for index issues
           }
          $('.accessionReactions').each(function(){
            var pooled = $(this).closest('tr').find('.accessionPooled').val(); //#First case determines the batch
            var accessionID = $(this).closest('tr').find('.accession').val();
            var n = $(this).attr("name");
            if(n.indexOf("redo") > -1){
              batchPooled = "N";
              pooled = "N";
            }
            if(!batchPooled){
              batchPooled = pooled;
            }
            if(override){
              console.log("Overriding to "+$('#caseType').val());
              batchPooled = $('#caseType').val();
            }
            i++; //#Add a new row to the main table.
            var rank = -1; //#for cases that don't match pooled/not pooled batch status
            if(pooled == batchPooled){
              var rank = $(this).closest('tr').find('.statit').val();
              switch(rank){
                case '9':
                  rank = 1000;
                  break;
                case '8':
                  rank = 500;
                  break;
                case '7':
                  rank = 250;
                  break;
                default:
                  rank = 125;
              }
            }
            T.push(new Array()); //#Create a new row in the table for each accession row
            T[i][0] = 0;
            var cnt = parseFloat($(this).val()); //#Gets weight for row
            if(n.indexOf("redo") > -1){
              rank = 1000;//#STAT
            }
            weights[i] = cnt;
            for(var j = 1;j<maxReactions+1;j++){
               if(j<cnt){
                 T[i][j] = T[i-1][j]; //#Don't add value 
               }
               else{
                 T[i][j] = Math.max( (rank+T[i-1][j-cnt]) , T[i-1][j] ); //#Core logic
               }
             }
          });
          var totalRows = i;
          //  var debug = ''; 
          //  for(var x=0;x<i+1;x++){
          //    for(var y=0;y<maxReactions+1;y++){
          //      debug+= ' '+T[x][y]
          //    }
          //    debug+='\n';
          //  }console.log(debug);

          //#We have now calculated the optimum batch combination.
          //#To get the correct rows, we must backtrack starting at bottom right.
          var rowsToAdd = [];
          var end = maxReactions;
          for(var i=totalRows;i>=0;i--){
            if(T[i][end]==0){
              break;
            }
            if(T[i][end] != T[i-1][end]){
              rowsToAdd.push(i);
              end = end - weights[i];
            }
          }
          var counter = 1;
          console.log("Attempting to batch "+rowsToAdd.length+" cases");
          //#Mark the correct Accessions as batched
          $('.accessionReactions').each(function(){
            if(rowsToAdd.indexOf(counter) > -1){
              $(this).closest('tr').find('.accession').css( "background-color", "#ffd699" );
              $(this).closest('tr').find('.accessionIncluded').val('included');
              sum += parseFloat($(this).val());
            }
            counter++;
          });

          if($('#processAnyway').is( ":checked" )) {
            minReactions = sum;
            $('#stepFormSubmitButton').show();
          }
          if(sum < minReactions) {
            $('.accession').css( "background-color", "white" );
            $('.accessionIncluded').val('');
            alert('Need ' + minReactions + ' Total Reactions to process.');
            $('#stepFormSubmitButton').hide();
            if(sum > 0) {
              $('#submitCheckbox').show();
            }
          }
          else {
            $('#stepFormSubmitButton').show();
          }
          $('#totalReactions').val(parseFloat(sum));
          $('#batchStatus').val(batchPooled);
          if(!override){
            ind = (batchPooled == "Y")? 0:1;
            $('#caseType').prop('selectedIndex',ind);
           }
        }