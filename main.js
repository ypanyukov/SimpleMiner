/**
 * Created by ypanyukov on 04.06.14.
 */

(function () {
    var minerField = document.getElementById('miner'),
        miner = new Miner(minerField, 10, 10),
        infoFieldFlags,
        infoFieldBombs,
        sample8x8,
        sample16x16,
        sample40x40,
        customWidthInput,
        customHeightInput,
        customBombCount,
        customSubmit;

    if (!isUndefined(document.querySelector)) {
        infoFieldFlags = document.querySelector('#minerControl .info .flags');
        infoFieldBombs = document.querySelector('#minerControl .info .bomb-count');
        sample8x8 = document.querySelector('#minerControl .samples .sample8x8');
        sample16x16 = document.querySelector('#minerControl .samples .sample16x16');
        sample40x40 = document.querySelector('#minerControl .samples .sample40x40');
        customWidthInput = document.querySelector('#minerControl .custom_field [name="customWidth"]');
        customHeightInput = document.querySelector('#minerControl .custom_field [name="customHeight"]');
        customBombCount = document.querySelector('#minerControl .custom_field [name="customBombCount"]');
        customSubmit = document.querySelector('#minerControl .custom_field [name="startCustom"]');
    }
    else {
        var controlField = document.getElementById('minerControl'),
            infoField = controlField.getElementsByClassName('info')[0],
            samples = controlField.getElementsByClassName('samples')[0],
            custom_field = controlField.getElementsByClassName('custom_field')[0];

        infoFieldFlags = infoField.getElementsByClassName('flags')[0];
        infoFieldBombs = infoField.getElementsByClassName('bomb-count')[0];

        sample8x8 = samples.getElementsByClassName('sample8x8')[0];
        sample16x16 = samples.getElementsByClassName('sample16x16')[0];
        sample40x40 = samples.getElementsByClassName('sample40x40')[0];

        customWidthInput = custom_field.getElementsByName('customWidth')[0];
        customHeightInput = custom_field.getElementsByName('customHeight')[0];
        customBombCount = custom_field.getElementsByName('customBombCount')[0];
        customSubmit = custom_field.getElementsByName('customSubmit')[0];
    }

    miner.writeFlagCountTo(infoFieldFlags);
    miner.writeBombCountTo(infoFieldBombs);

    sample8x8.addEvent('click', function () {
        miner.startNewGame({
            width: 8,
            height: 8
        });
    });
    sample16x16.addEvent('click', function () {
        miner.startNewGame({
            width: 16,
            height: 16
        });
    });
    sample40x40.addEvent('click', function () {
        miner.startNewGame({
            width: 40,
            height: 40
        });
    });

    customSubmit.addEvent('click', function () {
        miner.startNewGame({
            width: customWidthInput.value,
            height: customHeightInput.value,
            bombCount: customBombCount.value
        });
    });
})();