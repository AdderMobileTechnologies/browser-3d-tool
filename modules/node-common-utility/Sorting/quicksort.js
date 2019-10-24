const _swap = function(arr, i, j){
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
};

const _quickSortWithKey = function(arr, left, right, byKey) {
    const partition = function(arr, pivot, left, right, bykey) {
        const pivotValue = arr[pivot];
        let partitionIndex = left;

        for(let i = left; i < right; i++){
            if(arr[i][bykey] < pivotValue[bykey]){
                _swap(arr, i, partitionIndex);
                partitionIndex++;
            }
        }
        _swap(arr, right, partitionIndex);
        return partitionIndex;
    };


    if(left < right){
        let partitionIndex = partition(arr, right, left, right, byKey);

        //sort left and right
        _quickSortWithKey(arr, left, partitionIndex - 1, byKey);
        _quickSortWithKey(arr, partitionIndex + 1, right), byKey;
    }

    return arr;
};

const _quickSortWithoutKey = function(arr, left, right) {
    const partition = function(arr, pivot, left, right){
        const pivotValue = arr[pivot];
        let partitionIndex = left;

        for(let i = left; i < right; i++){
            if(arr[i] < pivotValue){
                _swap(arr, i, partitionIndex);
                partitionIndex++;
            }
        }
        _swap(arr, right, partitionIndex);
        return partitionIndex;
    };

    if(left < right){
        let partitionIndex = partition(arr, right, left, right);

        //sort left and right
        _quickSortWithoutKey(arr, left, partitionIndex - 1);
        _quickSortWithoutKey(arr, partitionIndex + 1, right);
    }
    return arr;
};

const quickSort = function(arr, left, right, byKey = null) {
    if(byKey !== null) {
        return _quickSortWithKey(arr, left, right, byKey);
    } else {
        return _quickSortWithoutKey(arr, left, right);
    }
};

module.exports = quickSort;