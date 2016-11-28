if ! [ -d "musiccodes" ]; then
	echo 'Please install musiccodes'
	exit -1
fi


if ! [ -d "meld" ]; then
	echo 'Please install meld'
	exit -1
fi

if ! [ -d "musiccodes/server/public/content" ]; then
	mkdir musiccodes/server/public/content
fi

cp mei-files/*.mei musiccodes/server/public/content/

cd scoretools
npm install --no-bin-links

node lib/makemuzicodes.js test/mkGameEngine-config.yml
cp test/mkGameEngine-out.json ../musiccodes/server/experiences/

