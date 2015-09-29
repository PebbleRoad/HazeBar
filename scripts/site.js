var Client = require('electron-rpc/client')
var client = new Client();
var ipc = require('ipc');

jQuery(function(){
	
	var NEA_API_KEY = '781CF461BB6606ADC4A6A6217F5F2AD6D25AB2F5FF4E2121',
		NEA_HAZE_URL = 'http://www.nea.gov.sg/api/WebAPI/?dataset=psi_update&keyref='+ NEA_API_KEY,
		areas = {
			rNO : 'North',
			rCE : 'Central',
			rEA : 'East',
			rWE : 'West',
			rSO : 'South'
		};

	var MenuBar = React.createClass({
		getInitialState: function(){

			return {
				records: [],
				loading: false
			}
		},
		refreshData: function(){

			this.setState({
				loading: true
			})

			jQuery.ajax({
				url: NEA_HAZE_URL,
				dataType: 'xml',					
				success: function(data){

					var dataObj = xmlToJson(data);
					
					this.setState({
						records: dataObj.channel.item.region,
						loading: false
					})

				}.bind(this)

			});

		},
		componentWillMount: function(){

			this.refreshData();

		},
		componentDidMount: function(){

			this._timer = setInterval(this.refreshData, 600000);
		},
		quit: function(){
			
			client.request('terminate')
		},
		render: function(){

			var records = [];
			if(!this.state.records.length) return null
			
			return (
				<div>
					<h2>PSI Readings</h2>

					<table>
						<thead>
							<tr>
								<th>Area</th>
								<th>PSI</th>
							</tr>
						</thead>
						<tbody>
							{this.state.records.map(function(region){
								
								var name = region.id['#text'],
									reading = region.record.reading[0]['@attributes'].value;

								if(areas.hasOwnProperty(name)){
									
									return (
										<tr>
											<td>{areas[name]}</td>
											<td>{reading}</td>
										</tr>
									)
								}
							})}
						</tbody>
					</table>

					<button onClick = {this.refreshData}>{this.state.loading? 'Loading': 'Refresh'}</button>
					<button onClick = {this.quit}>Quit</button>
				</div>
			)
		}
	});

	/**
	 * Utilities
	 */
	
	// Changes XML to JSON
	function xmlToJson(xml) {
		
		// Create the return object
		var obj = {};

		if (xml.nodeType == 1) { // element
			// do attributes
			if (xml.attributes.length > 0) {
			obj["@attributes"] = {};
				for (var j = 0; j < xml.attributes.length; j++) {
					var attribute = xml.attributes.item(j);
					obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
				}
			}
		} else if (xml.nodeType == 3) { // text
			obj = xml.nodeValue;
		}

		// do children
		if (xml.hasChildNodes()) {
			for(var i = 0; i < xml.childNodes.length; i++) {
				var item = xml.childNodes.item(i);
				var nodeName = item.nodeName;
				if (typeof(obj[nodeName]) == "undefined") {
					obj[nodeName] = xmlToJson(item);
				} else {
					if (typeof(obj[nodeName].push) == "undefined") {
						var old = obj[nodeName];
						obj[nodeName] = [];
						obj[nodeName].push(old);
					}
					obj[nodeName].push(xmlToJson(item));
				}
			}
		}
		return obj;
	};

	
	React.render(<MenuBar />, document.getElementById('root'));
	
})